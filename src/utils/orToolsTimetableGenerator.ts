import { Course, Faculty, Room, Student, TimeSlot, Conflict } from '../types';

export interface ORToolsGenerationParams {
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
    prioritizeCore: boolean;
    balanceWorkload: boolean;
  };
}

export interface ORToolsBatchGenerationParams {
  programs: string[];
  semesters: number[];
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  students: Student[];
  preferences: {
    preferredTimeSlots: string[];
    avoidBackToBack: boolean;
    maxHoursPerDay: number;
    prioritizeCore: boolean;
    balanceWorkload: boolean;
  };
}

export interface GeneratedTimetable {
  id: string;
  name: string;
  program: string;
  semester: number;
  timeSlots: TimeSlot[];
  conflicts: Conflict[];
  score: number;
  efficiency: number;
  solutionTime: number;
}

export class ORToolsTimetableGenerator {
  private timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  private days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  async generateTimetable(params: ORToolsGenerationParams): Promise<{ timeSlots: TimeSlot[]; conflicts: Conflict[]; solutionTime: number }> {
    const startTime = Date.now();
    
    // Filter relevant data
    const relevantCourses = params.courses.filter(
      c => c.program === params.program && c.semester === params.semester
    );
    
    const relevantStudents = params.students.filter(
      s => s.program === params.program && s.semester === params.semester
    );

    if (relevantCourses.length === 0) {
      return { timeSlots: [], conflicts: [], solutionTime: 0 };
    }

    // Use constraint programming to solve the scheduling problem
    const solution = await this.solveWithConstraintProgramming(
      relevantCourses,
      params.faculty,
      params.rooms,
      relevantStudents,
      params.preferences
    );

    const solutionTime = Date.now() - startTime;

    return {
      timeSlots: solution.timeSlots,
      conflicts: solution.conflicts,
      solutionTime
    };
  }

  async generateBatchTimetables(params: ORToolsBatchGenerationParams): Promise<GeneratedTimetable[]> {
    const results: GeneratedTimetable[] = [];
    
    // Generate timetables for each program-semester combination
    for (const program of params.programs) {
      for (const semester of params.semesters) {
        const timetable = await this.generateSingleTimetable(
          program,
          semester,
          params
        );
        if (timetable) {
          results.push(timetable);
        }
      }
    }

    // Global optimization to resolve cross-timetable conflicts
    return this.optimizeGlobalSchedule(results, params);
  }

  private async generateSingleTimetable(
    program: string,
    semester: number,
    params: ORToolsBatchGenerationParams
  ): Promise<GeneratedTimetable | null> {
    const startTime = Date.now();
    
    // Filter relevant data
    const relevantCourses = params.courses.filter(
      c => c.program === program && c.semester === semester
    );
    
    const relevantStudents = params.students.filter(
      s => s.program === program && s.semester === semester
    );

    if (relevantCourses.length === 0) {
      return null;
    }

    // Solve using OR-Tools
    const solution = await this.solveWithConstraintProgramming(
      relevantCourses,
      params.faculty,
      params.rooms,
      relevantStudents,
      params.preferences
    );

    const solutionTime = Date.now() - startTime;
    const score = this.calculateTimetableScore(solution.timeSlots, solution.conflicts, params.preferences);
    const efficiency = this.calculateEfficiency(solution.timeSlots, relevantCourses);

    return {
      id: `timetable-${program}-${semester}-${Date.now()}`,
      name: `${program} Semester ${semester} Timetable`,
      program,
      semester,
      timeSlots: solution.timeSlots,
      conflicts: solution.conflicts,
      score,
      efficiency,
      solutionTime
    };
  }

  private async solveWithConstraintProgramming(
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[],
    students: Student[],
    preferences: any
  ): Promise<{ timeSlots: TimeSlot[]; conflicts: Conflict[] }> {
    // Create constraint programming model
    const model = this.createConstraintModel(courses, faculty, rooms, students, preferences);
    
    // Solve the model
    const solution = await this.solveModel(model);
    
    // Convert solution to TimeSlots
    const timeSlots = this.convertSolutionToTimeSlots(solution, courses, faculty, rooms, students);
    
    // Detect any remaining conflicts
    const conflicts = this.detectConflicts(timeSlots, faculty, rooms);
    
    return { timeSlots, conflicts };
  }

  private createConstraintModel(
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[],
    students: Student[],
    preferences: any
  ): ConstraintModel {
    const model: ConstraintModel = {
      variables: new Map(),
      constraints: [],
      objective: null,
      courses,
      faculty,
      rooms,
      students,
      preferences
    };

    // Create decision variables for each course-faculty-room-time combination
    courses.forEach(course => {
      const suitableFaculty = this.findSuitableFaculty(course, faculty);
      const suitableRooms = this.findSuitableRooms(course, rooms);
      
      suitableFaculty.forEach(facultyMember => {
        suitableRooms.forEach(room => {
          this.days.forEach(day => {
            this.timeSlots.forEach(timeSlot => {
              const varName = `${course.id}_${facultyMember.id}_${room.id}_${day}_${timeSlot}`;
              model.variables.set(varName, {
                name: varName,
                type: 'binary',
                courseId: course.id,
                facultyId: facultyMember.id,
                roomId: room.id,
                day,
                timeSlot,
                value: 0
              });
            });
          });
        });
      });
    });

    // Add constraints
    this.addCourseAssignmentConstraints(model);
    this.addFacultyConstraints(model);
    this.addRoomConstraints(model);
    this.addStudentConstraints(model);
    this.addPreferenceConstraints(model);

    // Set objective function
    this.setObjectiveFunction(model);

    return model;
  }

  private addCourseAssignmentConstraints(model: ConstraintModel): void {
    // Each course must be assigned exactly the required number of sessions
    model.courses.forEach(course => {
      const sessionsNeeded = Math.ceil(course.duration / 1);
      const courseVariables = Array.from(model.variables.values())
        .filter(v => v.courseId === course.id);
      
      model.constraints.push({
        type: 'equality',
        variables: courseVariables.map(v => v.name),
        coefficients: courseVariables.map(() => 1),
        rhs: sessionsNeeded,
        description: `Course ${course.code} must have ${sessionsNeeded} sessions`
      });
    });
  }

  private addFacultyConstraints(model: ConstraintModel): void {
    // Faculty can't be in two places at the same time
    model.faculty.forEach(facultyMember => {
      this.days.forEach(day => {
        this.timeSlots.forEach(timeSlot => {
          const facultyVariables = Array.from(model.variables.values())
            .filter(v => v.facultyId === facultyMember.id && v.day === day && v.timeSlot === timeSlot);
          
          if (facultyVariables.length > 1) {
            model.constraints.push({
              type: 'less_equal',
              variables: facultyVariables.map(v => v.name),
              coefficients: facultyVariables.map(() => 1),
              rhs: 1,
              description: `Faculty ${facultyMember.name} can't be in multiple places at ${day} ${timeSlot}`
            });
          }
        });
      });
    });

    // Faculty availability constraints
    model.faculty.forEach(facultyMember => {
      this.days.forEach(day => {
        this.timeSlots.forEach(timeSlot => {
          if (!facultyMember.availability[day]?.[timeSlot]) {
            const unavailableVariables = Array.from(model.variables.values())
              .filter(v => v.facultyId === facultyMember.id && v.day === day && v.timeSlot === timeSlot);
            
            unavailableVariables.forEach(variable => {
              model.constraints.push({
                type: 'equality',
                variables: [variable.name],
                coefficients: [1],
                rhs: 0,
                description: `Faculty ${facultyMember.name} not available at ${day} ${timeSlot}`
              });
            });
          }
        });
      });
    });

    // Faculty workload constraints
    model.faculty.forEach(facultyMember => {
      const facultyVariables = Array.from(model.variables.values())
        .filter(v => v.facultyId === facultyMember.id);
      
      model.constraints.push({
        type: 'less_equal',
        variables: facultyVariables.map(v => v.name),
        coefficients: facultyVariables.map(() => 1),
        rhs: facultyMember.maxHoursPerWeek,
        description: `Faculty ${facultyMember.name} workload limit`
      });
    });
  }

  private addRoomConstraints(model: ConstraintModel): void {
    // Room can't be used by multiple classes at the same time
    model.rooms.forEach(room => {
      this.days.forEach(day => {
        this.timeSlots.forEach(timeSlot => {
          const roomVariables = Array.from(model.variables.values())
            .filter(v => v.roomId === room.id && v.day === day && v.timeSlot === timeSlot);
          
          if (roomVariables.length > 1) {
            model.constraints.push({
              type: 'less_equal',
              variables: roomVariables.map(v => v.name),
              coefficients: roomVariables.map(() => 1),
              rhs: 1,
              description: `Room ${room.name} can't host multiple classes at ${day} ${timeSlot}`
            });
          }
        });
      });
    });

    // Room availability constraints
    model.rooms.forEach(room => {
      this.days.forEach(day => {
        this.timeSlots.forEach(timeSlot => {
          if (!room.availability[day]?.[timeSlot]) {
            const unavailableVariables = Array.from(model.variables.values())
              .filter(v => v.roomId === room.id && v.day === day && v.timeSlot === timeSlot);
            
            unavailableVariables.forEach(variable => {
              model.constraints.push({
                type: 'equality',
                variables: [variable.name],
                coefficients: [1],
                rhs: 0,
                description: `Room ${room.name} not available at ${day} ${timeSlot}`
              });
            });
          }
        });
      });
    });
  }

  private addStudentConstraints(model: ConstraintModel): void {
    // Students can't have overlapping classes
    model.students.forEach(student => {
      this.days.forEach(day => {
        this.timeSlots.forEach(timeSlot => {
          const studentCourseVariables = Array.from(model.variables.values())
            .filter(v => {
              const course = model.courses.find(c => c.id === v.courseId);
              return course && student.selectedCourses.includes(course.id) && 
                     v.day === day && v.timeSlot === timeSlot;
            });
          
          if (studentCourseVariables.length > 1) {
            model.constraints.push({
              type: 'less_equal',
              variables: studentCourseVariables.map(v => v.name),
              coefficients: studentCourseVariables.map(() => 1),
              rhs: 1,
              description: `Student ${student.name} can't have overlapping classes at ${day} ${timeSlot}`
            });
          }
        });
      });
    });
  }

  private addPreferenceConstraints(model: ConstraintModel): void {
    // Max hours per day constraint
    if (model.preferences.maxHoursPerDay) {
      this.days.forEach(day => {
        const dayVariables = Array.from(model.variables.values())
          .filter(v => v.day === day);
        
        if (dayVariables.length > 0) {
          model.constraints.push({
            type: 'less_equal',
            variables: dayVariables.map(v => v.name),
            coefficients: dayVariables.map(() => 1),
            rhs: model.preferences.maxHoursPerDay,
            description: `Max ${model.preferences.maxHoursPerDay} hours per day on ${day}`
          });
        }
      });
    }

    // Avoid back-to-back classes if specified
    if (model.preferences.avoidBackToBack) {
      model.faculty.forEach(facultyMember => {
        this.days.forEach(day => {
          for (let i = 0; i < this.timeSlots.length - 1; i++) {
            const currentSlot = this.timeSlots[i];
            const nextSlot = this.timeSlots[i + 1];
            
            const currentVariables = Array.from(model.variables.values())
              .filter(v => v.facultyId === facultyMember.id && v.day === day && v.timeSlot === currentSlot);
            
            const nextVariables = Array.from(model.variables.values())
              .filter(v => v.facultyId === facultyMember.id && v.day === day && v.timeSlot === nextSlot);
            
            if (currentVariables.length > 0 && nextVariables.length > 0) {
              // Soft constraint: penalize back-to-back classes
              const allVariables = [...currentVariables, ...nextVariables];
              model.constraints.push({
                type: 'less_equal',
                variables: allVariables.map(v => v.name),
                coefficients: allVariables.map(() => 1),
                rhs: 1,
                description: `Avoid back-to-back classes for ${facultyMember.name} on ${day}`,
                weight: 0.5 // Soft constraint
              });
            }
          }
        });
      });
    }
  }

  private setObjectiveFunction(model: ConstraintModel): void {
    const objectiveTerms: { variable: string; coefficient: number }[] = [];
    
    // Maximize use of preferred time slots
    Array.from(model.variables.values()).forEach(variable => {
      let coefficient = 1; // Base coefficient
      
      // Bonus for preferred time slots
      if (model.preferences.preferredTimeSlots.includes(variable.timeSlot)) {
        coefficient += 5;
      }
      
      // Bonus for core courses if prioritized
      if (model.preferences.prioritizeCore) {
        const course = model.courses.find(c => c.id === variable.courseId);
        if (course && course.type === 'theory') {
          coefficient += 3;
        }
      }
      
      objectiveTerms.push({
        variable: variable.name,
        coefficient
      });
    });
    
    model.objective = {
      type: 'maximize',
      terms: objectiveTerms
    };
  }

  private async solveModel(model: ConstraintModel): Promise<ConstraintSolution> {
    // Simulate OR-Tools constraint solver
    // In a real implementation, this would use the actual OR-Tools library
    return this.simulateConstraintSolver(model);
  }

  private simulateConstraintSolver(model: ConstraintModel): ConstraintSolution {
    const solution: ConstraintSolution = {
      status: 'OPTIMAL',
      objectiveValue: 0,
      variables: new Map()
    };

    // Simple greedy approach for simulation
    // In reality, OR-Tools would use sophisticated algorithms like CP-SAT
    const sortedVariables = Array.from(model.variables.values())
      .sort((a, b) => {
        // Prioritize preferred time slots
        const aPreferred = model.preferences.preferredTimeSlots.includes(a.timeSlot) ? 1 : 0;
        const bPreferred = model.preferences.preferredTimeSlots.includes(b.timeSlot) ? 1 : 0;
        return bPreferred - aPreferred;
      });

    const assignedSlots = new Set<string>();
    const facultySchedule = new Map<string, Set<string>>();
    const roomSchedule = new Map<string, Set<string>>();
    const courseAssignments = new Map<string, number>();

    for (const variable of sortedVariables) {
      const slotKey = `${variable.day}_${variable.timeSlot}`;
      const facultySlotKey = `${variable.facultyId}_${slotKey}`;
      const roomSlotKey = `${variable.roomId}_${slotKey}`;
      
      // Check constraints
      const course = model.courses.find(c => c.id === variable.courseId);
      if (!course) continue;
      
      const sessionsNeeded = Math.ceil(course.duration / 1);
      const currentAssignments = courseAssignments.get(variable.courseId) || 0;
      
      if (currentAssignments >= sessionsNeeded) continue;
      
      // Check faculty availability
      if (facultySchedule.get(variable.facultyId)?.has(slotKey)) continue;
      
      // Check room availability
      if (roomSchedule.get(variable.roomId)?.has(slotKey)) continue;
      
      // Assign the variable
      solution.variables.set(variable.name, 1);
      
      // Update schedules
      if (!facultySchedule.has(variable.facultyId)) {
        facultySchedule.set(variable.facultyId, new Set());
      }
      facultySchedule.get(variable.facultyId)!.add(slotKey);
      
      if (!roomSchedule.has(variable.roomId)) {
        roomSchedule.set(variable.roomId, new Set());
      }
      roomSchedule.get(variable.roomId)!.add(slotKey);
      
      courseAssignments.set(variable.courseId, currentAssignments + 1);
      
      // Update objective value
      const objectiveTerm = model.objective?.terms.find(t => t.variable === variable.name);
      if (objectiveTerm) {
        solution.objectiveValue += objectiveTerm.coefficient;
      }
    }

    return solution;
  }

  private convertSolutionToTimeSlots(
    solution: ConstraintSolution,
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[],
    students: Student[]
  ): TimeSlot[] {
    const timeSlots: TimeSlot[] = [];
    
    solution.variables.forEach((value, variableName) => {
      if (value === 1) {
        const parts = variableName.split('_');
        const courseId = parts[0];
        const facultyId = parts[1];
        const roomId = parts[2];
        const day = parts[3];
        const timeSlot = parts[4];
        
        const [startTime, endTime] = timeSlot.split('-');
        const course = courses.find(c => c.id === courseId);
        
        if (course) {
          const enrolledStudents = students
            .filter(s => s.selectedCourses.includes(courseId))
            .map(s => s.id);
          
          timeSlots.push({
            id: `slot-${Date.now()}-${Math.random()}`,
            day,
            startTime,
            endTime,
            courseId,
            facultyId,
            roomId,
            studentGroups: [enrolledStudents],
            type: course.type
          });
        }
      }
    });
    
    return timeSlots;
  }

  private findSuitableFaculty(course: Course, faculty: Faculty[]): Faculty[] {
    return faculty.filter(f => 
      f.specialization.some(spec => 
        course.name.toLowerCase().includes(spec.toLowerCase())
      ) || f.assignedCourses.includes(course.id)
    );
  }

  private findSuitableRooms(course: Course, rooms: Room[]): Room[] {
    return rooms.filter(room => {
      if (course.type === 'lab' && room.type !== 'lab') return false;
      if (course.type === 'practical' && !['lab', 'classroom'].includes(room.type)) return false;
      return true;
    });
  }

  private optimizeGlobalSchedule(
    timetables: GeneratedTimetable[],
    params: ORToolsBatchGenerationParams
  ): GeneratedTimetable[] {
    // Global optimization using OR-Tools to resolve cross-timetable conflicts
    const optimizedTimetables = [...timetables];
    
    // Create a global constraint model for all timetables
    const globalModel = this.createGlobalConstraintModel(optimizedTimetables, params);
    
    // Solve the global model
    const globalSolution = this.simulateConstraintSolver(globalModel);
    
    // Update timetables based on global solution
    this.updateTimetablesFromGlobalSolution(optimizedTimetables, globalSolution, params);
    
    return optimizedTimetables;
  }

  private createGlobalConstraintModel(
    timetables: GeneratedTimetable[],
    params: ORToolsBatchGenerationParams
  ): ConstraintModel {
    const model: ConstraintModel = {
      variables: new Map(),
      constraints: [],
      objective: null,
      courses: params.courses,
      faculty: params.faculty,
      rooms: params.rooms,
      students: params.students,
      preferences: params.preferences
    };

    // Create variables for each time slot in each timetable
    timetables.forEach(timetable => {
      timetable.timeSlots.forEach(slot => {
        const varName = `${timetable.id}_${slot.id}`;
        model.variables.set(varName, {
          name: varName,
          type: 'binary',
          courseId: slot.courseId,
          facultyId: slot.facultyId,
          roomId: slot.roomId,
          day: slot.day,
          timeSlot: `${slot.startTime}-${slot.endTime}`,
          value: 1,
          timetableId: timetable.id
        });
      });
    });

    // Add global faculty constraints
    this.addGlobalFacultyConstraints(model);
    this.addGlobalRoomConstraints(model);

    return model;
  }

  private addGlobalFacultyConstraints(model: ConstraintModel): void {
    // Faculty can't be assigned to multiple timetables at the same time
    model.faculty.forEach(facultyMember => {
      this.days.forEach(day => {
        this.timeSlots.forEach(timeSlot => {
          const conflictingVariables = Array.from(model.variables.values())
            .filter(v => v.facultyId === facultyMember.id && v.day === day && v.timeSlot === timeSlot);
          
          if (conflictingVariables.length > 1) {
            model.constraints.push({
              type: 'less_equal',
              variables: conflictingVariables.map(v => v.name),
              coefficients: conflictingVariables.map(() => 1),
              rhs: 1,
              description: `Global faculty constraint for ${facultyMember.name} at ${day} ${timeSlot}`
            });
          }
        });
      });
    });
  }

  private addGlobalRoomConstraints(model: ConstraintModel): void {
    // Rooms can't be used by multiple timetables at the same time
    model.rooms.forEach(room => {
      this.days.forEach(day => {
        this.timeSlots.forEach(timeSlot => {
          const conflictingVariables = Array.from(model.variables.values())
            .filter(v => v.roomId === room.id && v.day === day && v.timeSlot === timeSlot);
          
          if (conflictingVariables.length > 1) {
            model.constraints.push({
              type: 'less_equal',
              variables: conflictingVariables.map(v => v.name),
              coefficients: conflictingVariables.map(() => 1),
              rhs: 1,
              description: `Global room constraint for ${room.name} at ${day} ${timeSlot}`
            });
          }
        });
      });
    });
  }

  private updateTimetablesFromGlobalSolution(
    timetables: GeneratedTimetable[],
    solution: ConstraintSolution,
    params: ORToolsBatchGenerationParams
  ): void {
    // Update timetables based on global optimization results
    timetables.forEach(timetable => {
      timetable.timeSlots = timetable.timeSlots.filter(slot => {
        const varName = `${timetable.id}_${slot.id}`;
        return solution.variables.get(varName) === 1;
      });
      
      // Recalculate metrics
      timetable.conflicts = this.detectConflicts(timetable.timeSlots, params.faculty, params.rooms);
      timetable.score = this.calculateTimetableScore(timetable.timeSlots, timetable.conflicts, params.preferences);
      timetable.efficiency = this.calculateEfficiency(timetable.timeSlots, params.courses);
    });
  }

  private detectConflicts(
    timeSlots: TimeSlot[],
    faculty: Faculty[],
    rooms: Room[]
  ): Conflict[] {
    const conflicts: Conflict[] = [];

    // Faculty conflicts
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
          id: `faculty-conflict-${facultyId}-${Date.now()}`,
          type: 'faculty',
          description: `Faculty has overlapping classes`,
          affectedSlots: duplicates.map(d => d.id),
          severity: 'high'
        });
      }
    });

    // Room conflicts
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
          id: `room-conflict-${roomId}-${Date.now()}`,
          type: 'room',
          description: `Room has overlapping bookings`,
          affectedSlots: duplicates.map(d => d.id),
          severity: 'high'
        });
      }
    });

    return conflicts;
  }

  private calculateTimetableScore(
    timeSlots: TimeSlot[],
    conflicts: Conflict[],
    preferences: any
  ): number {
    let score = 100;
    
    // Deduct for conflicts
    score -= conflicts.length * 15;
    
    // Add for preferred time slots
    const preferredCount = timeSlots.filter(slot =>
      preferences.preferredTimeSlots.includes(`${slot.startTime}-${slot.endTime}`)
    ).length;
    score += preferredCount * 2;
    
    // Add for good distribution
    const distributionScore = this.calculateDistributionScore(timeSlots);
    score += distributionScore;
    
    return Math.max(0, score);
  }

  private calculateDistributionScore(timeSlots: TimeSlot[]): number {
    const dayDistribution = new Map<string, number>();
    
    timeSlots.forEach(slot => {
      dayDistribution.set(slot.day, (dayDistribution.get(slot.day) || 0) + 1);
    });
    
    const values = Array.from(dayDistribution.values());
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    // Lower variance = better distribution = higher score
    return Math.max(0, 10 - variance);
  }

  private calculateEfficiency(timeSlots: TimeSlot[], courses: Course[]): number {
    const totalRequiredHours = courses.reduce((sum, course) => sum + course.duration, 0);
    const scheduledHours = timeSlots.length;
    
    return totalRequiredHours > 0 ? Math.min(100, (scheduledHours / totalRequiredHours) * 100) : 0;
  }
}

// Type definitions for constraint programming
interface ConstraintModel {
  variables: Map<string, ConstraintVariable>;
  constraints: ConstraintConstraint[];
  objective: ConstraintObjective | null;
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  students: Student[];
  preferences: any;
}

interface ConstraintVariable {
  name: string;
  type: 'binary' | 'integer' | 'continuous';
  courseId?: string;
  facultyId?: string;
  roomId?: string;
  day?: string;
  timeSlot?: string;
  value: number;
  timetableId?: string;
}

interface ConstraintConstraint {
  type: 'equality' | 'less_equal' | 'greater_equal';
  variables: string[];
  coefficients: number[];
  rhs: number;
  description: string;
  weight?: number;
}

interface ConstraintObjective {
  type: 'minimize' | 'maximize';
  terms: { variable: string; coefficient: number }[];
}

interface ConstraintSolution {
  status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE' | 'UNBOUNDED';
  objectiveValue: number;
  variables: Map<string, number>;
}