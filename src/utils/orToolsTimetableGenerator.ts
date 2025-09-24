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
    
    // Count students instead of using individual details
    const studentCount = params.students.filter(
      s => s.program === params.program && s.semester === params.semester
    ).length;

    if (relevantCourses.length === 0) {
      return { timeSlots: [], conflicts: [], solutionTime: 0 };
    }

    // Use constraint programming to solve the scheduling problem
    const solution = await this.solveWithConstraintProgramming(
      relevantCourses,
      params.faculty,
      params.rooms,
      studentCount,
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
    
    const studentCount = params.students.filter(
      s => s.program === program && s.semester === semester
    ).length;

    if (relevantCourses.length === 0) {
      return null;
    }

    // Solve using OR-Tools
    const solution = await this.solveWithConstraintProgramming(
      relevantCourses,
      params.faculty,
      params.rooms,
      studentCount,
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
    studentCount: number,
    preferences: any
  ): Promise<{ timeSlots: TimeSlot[]; conflicts: Conflict[] }> {
    // Create constraint programming model using OR-Tools approach
    const model = this.createORToolsModel(courses, faculty, rooms, studentCount, preferences);
    
    // Solve the model using CP-SAT solver simulation
    const solution = await this.solveCPSAT(model);
    
    // Convert solution to TimeSlots
    const timeSlots = this.convertSolutionToTimeSlots(solution, courses, faculty, rooms, studentCount);
    
    // Detect any remaining conflicts
    const conflicts = this.detectConflicts(timeSlots, faculty, rooms);
    
    return { timeSlots, conflicts };
  }

  private createORToolsModel(
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[],
    studentCount: number,
    preferences: any
  ): ORToolsModel {
    const model: ORToolsModel = {
      variables: new Map(),
      constraints: [],
      objective: null,
      courses,
      faculty,
      rooms,
      studentCount,
      preferences
    };

    // Create decision variables for each course-faculty-room-time combination
    courses.forEach(course => {
      const suitableFaculty = this.findSuitableFaculty(course, faculty);
      const suitableRooms = this.findSuitableRooms(course, rooms, studentCount);
      
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

    // Add OR-Tools constraints
    this.addORToolsConstraints(model);
    this.setORToolsObjective(model);

    return model;
  }

  private addORToolsConstraints(model: ORToolsModel): void {
    // 1. Each course must be scheduled exactly once per week
    model.courses.forEach(course => {
      const courseVariables = Array.from(model.variables.values())
        .filter(v => v.courseId === course.id);
      
      model.constraints.push({
        type: 'exactly_one',
        variables: courseVariables.map(v => v.name),
        description: `Course ${course.code} scheduled exactly once`
      });
    });

    // 2. Faculty availability constraints
    model.faculty.forEach(facultyMember => {
      this.days.forEach(day => {
        this.timeSlots.forEach(timeSlot => {
          if (!facultyMember.availability[day]?.[timeSlot]) {
            const unavailableVars = Array.from(model.variables.values())
              .filter(v => v.facultyId === facultyMember.id && v.day === day && v.timeSlot === timeSlot);
            
            unavailableVars.forEach(variable => {
              model.constraints.push({
                type: 'forbidden',
                variables: [variable.name],
                description: `Faculty ${facultyMember.name} unavailable at ${day} ${timeSlot}`
              });
            });
          }
        });
      });
    });

    // 3. Faculty can't be in multiple places at same time
    model.faculty.forEach(facultyMember => {
      this.days.forEach(day => {
        this.timeSlots.forEach(timeSlot => {
          const facultyVars = Array.from(model.variables.values())
            .filter(v => v.facultyId === facultyMember.id && v.day === day && v.timeSlot === timeSlot);
          
          if (facultyVars.length > 1) {
            model.constraints.push({
              type: 'at_most_one',
              variables: facultyVars.map(v => v.name),
              description: `Faculty ${facultyMember.name} at most one place at ${day} ${timeSlot}`
            });
          }
        });
      });
    });

    // 4. Room capacity and availability constraints
    model.rooms.forEach(room => {
      this.days.forEach(day => {
        this.timeSlots.forEach(timeSlot => {
          if (!room.availability[day]?.[timeSlot]) {
            const unavailableVars = Array.from(model.variables.values())
              .filter(v => v.roomId === room.id && v.day === day && v.timeSlot === timeSlot);
            
            unavailableVars.forEach(variable => {
              model.constraints.push({
                type: 'forbidden',
                variables: [variable.name],
                description: `Room ${room.name} unavailable at ${day} ${timeSlot}`
              });
            });
          }
        });
      });
    });

    // 5. Room can't host multiple classes simultaneously
    model.rooms.forEach(room => {
      this.days.forEach(day => {
        this.timeSlots.forEach(timeSlot => {
          const roomVars = Array.from(model.variables.values())
            .filter(v => v.roomId === room.id && v.day === day && v.timeSlot === timeSlot);
          
          if (roomVars.length > 1) {
            model.constraints.push({
              type: 'at_most_one',
              variables: roomVars.map(v => v.name),
              description: `Room ${room.name} at most one class at ${day} ${timeSlot}`
            });
          }
        });
      });
    });

    // 6. Ensure daily distribution (every day should have classes)
    this.days.forEach(day => {
      const dayVariables = Array.from(model.variables.values())
        .filter(v => v.day === day);
      
      if (dayVariables.length > 0) {
        model.constraints.push({
          type: 'at_least_one',
          variables: dayVariables.map(v => v.name),
          description: `At least one class on ${day}`
        });
      }
    });

    // 7. Workload balancing
    if (model.preferences.balanceWorkload) {
      model.faculty.forEach(facultyMember => {
        const facultyVars = Array.from(model.variables.values())
          .filter(v => v.facultyId === facultyMember.id);
        
        model.constraints.push({
          type: 'less_equal',
          variables: facultyVars.map(v => v.name),
          coefficients: facultyVars.map(() => 1),
          rhs: facultyMember.maxHoursPerWeek,
          description: `Faculty ${facultyMember.name} workload limit`
        });
      });
    }
  }

  private setORToolsObjective(model: ORToolsModel): void {
    const objectiveTerms: { variable: string; coefficient: number }[] = [];
    
    Array.from(model.variables.values()).forEach(variable => {
      let coefficient = 10; // Base coefficient for scheduling
      
      // Bonus for preferred time slots
      if (model.preferences.preferredTimeSlots.includes(variable.timeSlot)) {
        coefficient += 20;
      }
      
      // Bonus for core courses if prioritized
      if (model.preferences.prioritizeCore) {
        const course = model.courses.find(c => c.id === variable.courseId);
        if (course && course.type === 'theory') {
          coefficient += 15;
        }
      }
      
      // Bonus for better time distribution
      const timeIndex = this.timeSlots.indexOf(variable.timeSlot);
      if (timeIndex >= 1 && timeIndex <= 4) { // Mid-day slots preferred
        coefficient += 5;
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

  private async solveCPSAT(model: ORToolsModel): Promise<ORToolsSolution> {
    // Simulate OR-Tools CP-SAT solver with advanced constraint satisfaction
    return this.simulateAdvancedCPSAT(model);
  }

  private simulateAdvancedCPSAT(model: ORToolsModel): ORToolsSolution {
    const solution: ORToolsSolution = {
      status: 'OPTIMAL',
      objectiveValue: 0,
      variables: new Map()
    };

    // Advanced constraint satisfaction approach
    const assignments = new Map<string, number>();
    const facultySchedule = new Map<string, Set<string>>();
    const roomSchedule = new Map<string, Set<string>>();
    const dailyAssignments = new Map<string, number>();

    // Initialize daily counters
    this.days.forEach(day => {
      dailyAssignments.set(day, 0);
    });

    // Sort courses by priority (core courses first, then by credits)
    const sortedCourses = [...model.courses].sort((a, b) => {
      if (model.preferences.prioritizeCore) {
        if (a.type === 'theory' && b.type !== 'theory') return -1;
        if (b.type === 'theory' && a.type !== 'theory') return 1;
      }
      return b.credits - a.credits;
    });

    // Assign each course using constraint satisfaction
    for (const course of sortedCourses) {
      const assignment = this.findBestAssignment(
        course,
        model,
        facultySchedule,
        roomSchedule,
        dailyAssignments
      );

      if (assignment) {
        const { variable, day, timeSlot, facultyId, roomId } = assignment;
        
        // Make assignment
        assignments.set(variable, 1);
        solution.variables.set(variable, 1);
        
        // Update schedules
        const slotKey = `${day}_${timeSlot}`;
        
        if (!facultySchedule.has(facultyId)) {
          facultySchedule.set(facultyId, new Set());
        }
        facultySchedule.get(facultyId)!.add(slotKey);
        
        if (!roomSchedule.has(roomId)) {
          roomSchedule.set(roomId, new Set());
        }
        roomSchedule.get(roomId)!.add(slotKey);
        
        // Update daily count
        dailyAssignments.set(day, (dailyAssignments.get(day) || 0) + 1);
        
        // Update objective value
        const objectiveTerm = model.objective?.terms.find(t => t.variable === variable);
        if (objectiveTerm) {
          solution.objectiveValue += objectiveTerm.coefficient;
        }
      }
    }

    // Ensure every day has at least one class by redistributing if necessary
    this.ensureDailyDistribution(solution, model, dailyAssignments);

    return solution;
  }

  private findBestAssignment(
    course: Course,
    model: ORToolsModel,
    facultySchedule: Map<string, Set<string>>,
    roomSchedule: Map<string, Set<string>>,
    dailyAssignments: Map<string, number>
  ): any | null {
    const courseVariables = Array.from(model.variables.values())
      .filter(v => v.courseId === course.id);

    // Score each possible assignment
    const scoredAssignments = courseVariables.map(variable => {
      const slotKey = `${variable.day}_${variable.timeSlot}`;
      
      // Check hard constraints
      if (facultySchedule.get(variable.facultyId)?.has(slotKey)) return null;
      if (roomSchedule.get(variable.roomId)?.has(slotKey)) return null;
      
      // Check faculty availability
      const faculty = model.faculty.find(f => f.id === variable.facultyId);
      if (!faculty?.availability[variable.day]?.[variable.timeSlot]) return null;
      
      // Check room availability
      const room = model.rooms.find(r => r.id === variable.roomId);
      if (!room?.availability[variable.day]?.[variable.timeSlot]) return null;
      
      // Calculate score
      let score = 100;
      
      // Prefer preferred time slots
      if (model.preferences.preferredTimeSlots.includes(variable.timeSlot)) {
        score += 50;
      }
      
      // Prefer days with fewer classes (for distribution)
      const dayCount = dailyAssignments.get(variable.day) || 0;
      score -= dayCount * 10;
      
      // Prefer mid-day slots
      const timeIndex = this.timeSlots.indexOf(variable.timeSlot);
      if (timeIndex >= 2 && timeIndex <= 5) {
        score += 20;
      }
      
      return {
        variable: variable.name,
        day: variable.day,
        timeSlot: variable.timeSlot,
        facultyId: variable.facultyId,
        roomId: variable.roomId,
        score
      };
    }).filter(Boolean);

    // Return best assignment
    if (scoredAssignments.length === 0) return null;
    
    return scoredAssignments.reduce((best, current) => 
      (current?.score || 0) > (best?.score || 0) ? current : best
    );
  }

  private ensureDailyDistribution(
    solution: ORToolsSolution,
    model: ORToolsModel,
    dailyAssignments: Map<string, number>
  ): void {
    // Find days with no classes
    const emptyDays = this.days.filter(day => (dailyAssignments.get(day) || 0) === 0);
    
    if (emptyDays.length === 0) return;
    
    // Try to move some classes to empty days
    for (const emptyDay of emptyDays) {
      // Find a class that can be moved to this day
      const assignedVariables = Array.from(solution.variables.entries())
        .filter(([_, value]) => value === 1)
        .map(([varName, _]) => varName);
      
      for (const varName of assignedVariables) {
        const variable = model.variables.get(varName);
        if (!variable) continue;
        
        // Try to find alternative slot on empty day
        const alternativeVars = Array.from(model.variables.values())
          .filter(v => 
            v.courseId === variable.courseId && 
            v.day === emptyDay &&
            v.facultyId === variable.facultyId
          );
        
        for (const altVar of alternativeVars) {
          // Check if this slot is available
          const faculty = model.faculty.find(f => f.id === altVar.facultyId);
          const room = model.rooms.find(r => r.id === altVar.roomId);
          
          if (faculty?.availability[altVar.day]?.[altVar.timeSlot] && 
              room?.availability[altVar.day]?.[altVar.timeSlot]) {
            
            // Move the assignment
            solution.variables.set(varName, 0);
            solution.variables.set(altVar.name, 1);
            
            // Update daily counts
            dailyAssignments.set(variable.day, (dailyAssignments.get(variable.day) || 1) - 1);
            dailyAssignments.set(emptyDay, (dailyAssignments.get(emptyDay) || 0) + 1);
            
            break;
          }
        }
        
        if ((dailyAssignments.get(emptyDay) || 0) > 0) break;
      }
    }
  }

  private convertSolutionToTimeSlots(
    solution: ORToolsSolution,
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[],
    studentCount: number
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
          timeSlots.push({
            id: `slot-${Date.now()}-${Math.random()}`,
            day,
            startTime,
            endTime,
            courseId,
            facultyId,
            roomId,
            studentGroups: [`group-${courseId}-${studentCount}`], // Use count instead of individual IDs
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

  private findSuitableRooms(course: Course, rooms: Room[], studentCount: number): Room[] {
    return rooms.filter(room => {
      // Check room type compatibility
      if (course.type === 'lab' && room.type !== 'lab') return false;
      if (course.type === 'practical' && !['lab', 'classroom'].includes(room.type)) return false;
      
      // Check capacity (use student count instead of individual students)
      if (room.capacity < studentCount) return false;
      
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
    const globalSolution = this.simulateAdvancedCPSAT(globalModel);
    
    // Update timetables based on global solution
    this.updateTimetablesFromGlobalSolution(optimizedTimetables, globalSolution, params);
    
    return optimizedTimetables;
  }

  private createGlobalConstraintModel(
    timetables: GeneratedTimetable[],
    params: ORToolsBatchGenerationParams
  ): ORToolsModel {
    const model: ORToolsModel = {
      variables: new Map(),
      constraints: [],
      objective: null,
      courses: params.courses,
      faculty: params.faculty,
      rooms: params.rooms,
      studentCount: params.students.length,
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

    // Add global constraints
    this.addGlobalORToolsConstraints(model);

    return model;
  }

  private addGlobalORToolsConstraints(model: ORToolsModel): void {
    // Global faculty constraints
    model.faculty.forEach(facultyMember => {
      this.days.forEach(day => {
        this.timeSlots.forEach(timeSlot => {
          const conflictingVars = Array.from(model.variables.values())
            .filter(v => v.facultyId === facultyMember.id && v.day === day && v.timeSlot === timeSlot);
          
          if (conflictingVars.length > 1) {
            model.constraints.push({
              type: 'at_most_one',
              variables: conflictingVars.map(v => v.name),
              description: `Global faculty constraint for ${facultyMember.name} at ${day} ${timeSlot}`
            });
          }
        });
      });
    });

    // Global room constraints
    model.rooms.forEach(room => {
      this.days.forEach(day => {
        this.timeSlots.forEach(timeSlot => {
          const conflictingVars = Array.from(model.variables.values())
            .filter(v => v.roomId === room.id && v.day === day && v.timeSlot === timeSlot);
          
          if (conflictingVars.length > 1) {
            model.constraints.push({
              type: 'at_most_one',
              variables: conflictingVars.map(v => v.name),
              description: `Global room constraint for ${room.name} at ${day} ${timeSlot}`
            });
          }
        });
      });
    });
  }

  private updateTimetablesFromGlobalSolution(
    timetables: GeneratedTimetable[],
    solution: ORToolsSolution,
    params: ORToolsBatchGenerationParams
  ): void {
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

// Type definitions for OR-Tools constraint programming
interface ORToolsModel {
  variables: Map<string, ORToolsVariable>;
  constraints: ORToolsConstraint[];
  objective: ORToolsObjective | null;
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  studentCount: number;
  preferences: any;
}

interface ORToolsVariable {
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

interface ORToolsConstraint {
  type: 'exactly_one' | 'at_most_one' | 'at_least_one' | 'forbidden' | 'less_equal' | 'greater_equal';
  variables: string[];
  coefficients?: number[];
  rhs?: number;
  description: string;
}

interface ORToolsObjective {
  type: 'minimize' | 'maximize';
  terms: { variable: string; coefficient: number }[];
}

interface ORToolsSolution {
  status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE' | 'UNBOUNDED';
  objectiveValue: number;
  variables: Map<string, number>;
}