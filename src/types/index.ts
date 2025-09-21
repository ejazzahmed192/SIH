export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: 'theory' | 'practical' | 'lab' | 'project' | 'fieldwork' | 'internship' | 'teaching-practice';
  program: 'FYUP' | 'B.Ed' | 'M.Ed' | 'ITEP';
  semester: number;
  duration: number; // in hours
  prerequisites?: string[];
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  specialization: string[];
  maxHoursPerWeek: number;
  availability: {
    [key: string]: { // day of week
      [key: string]: boolean; // time slot
    };
  };
  assignedCourses: string[];
}

export interface Room {
  id: string;
  name: string;
  type: 'classroom' | 'lab' | 'seminar' | 'auditorium';
  capacity: number;
  equipment: string[];
  availability: {
    [key: string]: { // day of week
      [key: string]: boolean; // time slot
    };
  };
}

export interface Student {
  id: string;
  name: string;
  email: string;
  program: 'FYUP' | 'B.Ed' | 'M.Ed' | 'ITEP';
  semester: number;
  selectedCourses: string[];
}

export interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  courseId: string;
  facultyId: string;
  roomId: string;
  studentGroups: string[];
  type: Course['type'];
}

export interface TimetableData {
  id: string;
  name: string;
  program: string;
  semester: number;
  academicYear: string;
  timeSlots: TimeSlot[];
  conflicts: Conflict[];
  lastModified: Date;
}

export interface Conflict {
  id: string;
  type: 'faculty' | 'room' | 'student';
  description: string;
  affectedSlots: string[];
  severity: 'low' | 'medium' | 'high';
}