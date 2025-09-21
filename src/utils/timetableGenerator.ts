import { Course, Faculty, Room, Student, TimeSlot, Conflict } from '../types';

export interface GenerationParams {
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  students: Student[];
  program: string;
  semester: number;
  preferences: {
    preferredTimeSlots: string[];
    avoidBackToBack: boolean;
    maxHoursPerDay: number;
  };
}

export class TimetableGenerator {
  private timeSlots = [
    '09:00-10:00',
    '10:00-11:00', 
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00'
  ];

  private days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  generateTimetable(params: GenerationParams): { timeSlots: TimeSlot[]; conflicts: Conflict[] } {
    const { courses, faculty, rooms, students, program, semester } = params;
    
    // Filter courses by program and semester
    const relevantCourses = courses.filter(
      course => course.program === program && course.semester === semester
    );

    const generatedSlots: TimeSlot[] = [];
    const conflicts: Conflict[] = [];

    // Sort courses by priority (theory first, then practicals, then labs)
    const prioritizedCourses = this.prioritizeCourses(relevantCourses);

    for (const course of prioritizedCourses) {
      const assignment = this.assignCourseToSlot(
        course,
        faculty,
        rooms,
        students,
        generatedSlots,
        params.preferences
      );

      if (assignment.success) {
        generatedSlots.push(...assignment.slots);
      } else {
        conflicts.push(...assignment.conflicts);
      }
    }

    // Detect additional conflicts
    const additionalConflicts = this.detectConflicts(generatedSlots, faculty, rooms, students);
    conflicts.push(...additionalConflicts);

    return { timeSlots: generatedSlots, conflicts };
  }

  private prioritizeCourses(courses: Course[]): Course[] {
    const priority = { 'theory': 1, 'practical': 2, 'lab': 3, 'project': 4, 'fieldwork': 5, 'internship': 6, 'teaching-practice': 7 };
    return courses.sort((a, b) => priority[a.type] - priority[b.type]);
  }

  private assignCourseToSlot(
    course: Course,
    faculty: Faculty[],
    rooms: Room[],
    students: Student[],
    existingSlots: TimeSlot[],
    preferences: any
  ): { success: boolean; slots: TimeSlot[]; conflicts: Conflict[] } {
    // Find available faculty
    const availableFaculty = faculty.filter(f => 
      f.specialization.some(spec => course.name.toLowerCase().includes(spec.toLowerCase())) ||
      f.assignedCourses.includes(course.id)
    );

    if (availableFaculty.length === 0) {
      return {
        success: false,
        slots: [],
        conflicts: [{
          id: `conflict-${Date.now()}`,
          type: 'faculty',
          description: `No available faculty for course ${course.name}`,
          affectedSlots: [],
          severity: 'high'
        }]
      };
    }

    // Find available rooms
    const suitableRooms = rooms.filter(room => {
      if (course.type === 'lab' && room.type !== 'lab') return false;
      if (course.type === 'practical' && !['lab', 'classroom'].includes(room.type)) return false;
      return true;
    });

    if (suitableRooms.length === 0) {
      return {
        success: false,
        slots: [],
        conflicts: [{
          id: `conflict-${Date.now()}`,
          type: 'room',
          description: `No suitable room available for course ${course.name}`,
          affectedSlots: [],
          severity: 'high'
        }]
      };
    }

    // Find students enrolled in this course
    const enrolledStudents = students.filter(s => 
      s.selectedCourses.includes(course.id) && 
      s.program === course.program
    );

    const studentGroups = this.groupStudents(enrolledStudents, suitableRooms[0].capacity);

    const slots: TimeSlot[] = [];
    const conflicts: Conflict[] = [];

    // Try to assign time slots for each session
    const sessionsNeeded = Math.ceil(course.duration / 1); // Assuming 1-hour slots

    for (let session = 0; session < sessionsNeeded; session++) {
      const assignment = this.findAvailableSlot(
        course,
        availableFaculty[0],
        suitableRooms[0],
        studentGroups,
        existingSlots,
        slots
      );

      if (assignment) {
        slots.push(assignment);
      } else {
        conflicts.push({
          id: `conflict-${Date.now()}-${session}`,
          type: 'faculty',
          description: `Cannot schedule session ${session + 1} for ${course.name}`,
          affectedSlots: [],
          severity: 'medium'
        });
      }
    }

    return {
      success: slots.length === sessionsNeeded,
      slots,
      conflicts
    };
  }

  private groupStudents(students: Student[], roomCapacity: number): string[][] {
    const groups: string[][] = [];
    for (let i = 0; i < students.length; i += roomCapacity) {
      groups.push(students.slice(i, i + roomCapacity).map(s => s.id));
    }
    return groups;
  }

  private findAvailableSlot(
    course: Course,
    faculty: Faculty,
    room: Room,
    studentGroups: string[][],
    existingSlots: TimeSlot[],
    currentSlots: TimeSlot[]
  ): TimeSlot | null {
    for (const day of this.days) {
      for (const timeSlot of this.timeSlots) {
        const [startTime, endTime] = timeSlot.split('-');
        
        // Check if faculty is available
        if (!faculty.availability[day]?.[timeSlot]) continue;
        
        // Check if room is available
        if (!room.availability[day]?.[timeSlot]) continue;
        
        // Check for conflicts with existing slots
        const hasConflict = [...existingSlots, ...currentSlots].some(slot => 
          slot.day === day && 
          slot.startTime === startTime &&
          (slot.facultyId === faculty.id || slot.roomId === room.id)
        );
        
        if (hasConflict) continue;

        return {
          id: `slot-${Date.now()}-${Math.random()}`,
          day,
          startTime,
          endTime,
          courseId: course.id,
          facultyId: faculty.id,
          roomId: room.id,
          studentGroups: studentGroups[0] || [],
          type: course.type
        };
      }
    }
    
    return null;
  }

  private detectConflicts(
    timeSlots: TimeSlot[],
    faculty: Faculty[],
    rooms: Room[],
    students: Student[]
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // Check for faculty double-booking
    const facultySlots = new Map<string, TimeSlot[]>();
    timeSlots.forEach(slot => {
      if (!facultySlots.has(slot.facultyId)) {
        facultySlots.set(slot.facultyId, []);
      }
      facultySlots.get(slot.facultyId)!.push(slot);
    });

    facultySlots.forEach((slots, facultyId) => {
      const duplicates = slots.filter((slot, index) =>
        slots.findIndex(s => s.day === slot.day && s.startTime === slot.startTime) !== index
      );

      if (duplicates.length > 0) {
        conflicts.push({
          id: `faculty-conflict-${facultyId}`,
          type: 'faculty',
          description: `Faculty ${faculty.find(f => f.id === facultyId)?.name} has overlapping classes`,
          affectedSlots: duplicates.map(d => d.id),
          severity: 'high'
        });
      }
    });

    // Check for room double-booking
    const roomSlots = new Map<string, TimeSlot[]>();
    timeSlots.forEach(slot => {
      if (!roomSlots.has(slot.roomId)) {
        roomSlots.set(slot.roomId, []);
      }
      roomSlots.get(slot.roomId)!.push(slot);
    });

    roomSlots.forEach((slots, roomId) => {
      const duplicates = slots.filter((slot, index) =>
        slots.findIndex(s => s.day === slot.day && s.startTime === slot.startTime) !== index
      );

      if (duplicates.length > 0) {
        conflicts.push({
          id: `room-conflict-${roomId}`,
          type: 'room',
          description: `Room ${rooms.find(r => r.id === roomId)?.name} has overlapping bookings`,
          affectedSlots: duplicates.map(d => d.id),
          severity: 'high'
        });
      }
    });

    return conflicts;
  }

  optimizeTimetable(timeSlots: TimeSlot[]): TimeSlot[] {
    // Implementation for optimization algorithm
    // This could include genetic algorithms, constraint satisfaction, etc.
    return timeSlots;
  }
}