import { Course, Faculty, Room, Student, TimeSlot, Conflict } from '../types';

export interface BatchGenerationParams {
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
}

export class AITimetableGenerator {
  private timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  private days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  async generateBatchTimetables(params: BatchGenerationParams): Promise<GeneratedTimetable[]> {
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

    // Apply AI optimization across all timetables
    return this.optimizeGlobalSchedule(results, params);
  }

  private async generateSingleTimetable(
    program: string,
    semester: number,
    params: BatchGenerationParams
  ): Promise<GeneratedTimetable | null> {
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

    // AI-powered course scheduling
    const scheduledSlots = await this.scheduleCoursesWithAI(
      relevantCourses,
      params.faculty,
      params.rooms,
      relevantStudents,
      params.preferences
    );

    // Detect conflicts
    const conflicts = this.detectConflicts(scheduledSlots, params.faculty, params.rooms);

    // Calculate efficiency score
    const score = this.calculateTimetableScore(scheduledSlots, conflicts, params.preferences);
    const efficiency = this.calculateEfficiency(scheduledSlots, relevantCourses);

    return {
      id: `timetable-${program}-${semester}-${Date.now()}`,
      name: `${program} Semester ${semester} Timetable`,
      program,
      semester,
      timeSlots: scheduledSlots,
      conflicts,
      score,
      efficiency
    };
  }

  private async scheduleCoursesWithAI(
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[],
    students: Student[],
    preferences: any
  ): Promise<TimeSlot[]> {
    const scheduledSlots: TimeSlot[] = [];
    
    // AI Algorithm: Genetic Algorithm approach
    const population = this.generateInitialPopulation(courses, faculty, rooms, students, 50);
    let bestSolution = population[0];
    
    // Evolution iterations
    for (let generation = 0; generation < 100; generation++) {
      const newPopulation = [];
      
      // Selection and crossover
      for (let i = 0; i < population.length; i += 2) {
        const parent1 = this.tournamentSelection(population);
        const parent2 = this.tournamentSelection(population);
        const [child1, child2] = this.crossover(parent1, parent2);
        
        newPopulation.push(this.mutate(child1, preferences));
        newPopulation.push(this.mutate(child2, preferences));
      }
      
      // Evaluate fitness
      newPopulation.forEach(solution => {
        solution.fitness = this.evaluateFitness(solution, preferences);
      });
      
      // Update best solution
      const currentBest = newPopulation.reduce((best, current) => 
        current.fitness > best.fitness ? current : best
      );
      
      if (currentBest.fitness > bestSolution.fitness) {
        bestSolution = currentBest;
      }
      
      // Replace population
      population.splice(0, population.length, ...newPopulation);
    }

    return bestSolution.timeSlots;
  }

  private generateInitialPopulation(
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[],
    students: Student[],
    populationSize: number
  ): any[] {
    const population = [];
    
    for (let i = 0; i < populationSize; i++) {
      const solution = {
        timeSlots: this.generateRandomSchedule(courses, faculty, rooms, students),
        fitness: 0
      };
      population.push(solution);
    }
    
    return population;
  }

  private generateRandomSchedule(
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[],
    students: Student[]
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    
    for (const course of courses) {
      // Find suitable faculty
      const suitableFaculty = faculty.filter(f => 
        f.specialization.some(spec => 
          course.name.toLowerCase().includes(spec.toLowerCase())
        ) || f.assignedCourses.includes(course.id)
      );
      
      // Find suitable rooms
      const suitableRooms = rooms.filter(room => {
        if (course.type === 'lab' && room.type !== 'lab') return false;
        if (course.type === 'practical' && !['lab', 'classroom'].includes(room.type)) return false;
        return true;
      });
      
      if (suitableFaculty.length > 0 && suitableRooms.length > 0) {
        const sessionsNeeded = Math.ceil(course.duration / 1);
        
        for (let session = 0; session < sessionsNeeded; session++) {
          const randomDay = this.days[Math.floor(Math.random() * this.days.length)];
          const randomTimeSlot = this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)];
          const [startTime, endTime] = randomTimeSlot.split('-');
          
          const slot: TimeSlot = {
            id: `slot-${course.id}-${session}-${Date.now()}-${Math.random()}`,
            day: randomDay,
            startTime,
            endTime,
            courseId: course.id,
            facultyId: suitableFaculty[Math.floor(Math.random() * suitableFaculty.length)].id,
            roomId: suitableRooms[Math.floor(Math.random() * suitableRooms.length)].id,
            studentGroups: students.filter(s => s.selectedCourses.includes(course.id)).map(s => s.id),
            type: course.type
          };
          
          slots.push(slot);
        }
      }
    }
    
    return slots;
  }

  private tournamentSelection(population: any[]): any {
    const tournamentSize = 3;
    const tournament = [];
    
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }
    
    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    );
  }

  private crossover(parent1: any, parent2: any): [any, any] {
    const crossoverPoint = Math.floor(Math.random() * parent1.timeSlots.length);
    
    const child1 = {
      timeSlots: [
        ...parent1.timeSlots.slice(0, crossoverPoint),
        ...parent2.timeSlots.slice(crossoverPoint)
      ],
      fitness: 0
    };
    
    const child2 = {
      timeSlots: [
        ...parent2.timeSlots.slice(0, crossoverPoint),
        ...parent1.timeSlots.slice(crossoverPoint)
      ],
      fitness: 0
    };
    
    return [child1, child2];
  }

  private mutate(solution: any, preferences: any): any {
    const mutationRate = 0.1;
    
    if (Math.random() < mutationRate) {
      const randomSlotIndex = Math.floor(Math.random() * solution.timeSlots.length);
      const slot = solution.timeSlots[randomSlotIndex];
      
      // Mutate time or day
      if (Math.random() < 0.5) {
        slot.day = this.days[Math.floor(Math.random() * this.days.length)];
      } else {
        const randomTimeSlot = this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)];
        const [startTime, endTime] = randomTimeSlot.split('-');
        slot.startTime = startTime;
        slot.endTime = endTime;
      }
    }
    
    return solution;
  }

  private evaluateFitness(solution: any, preferences: any): number {
    let fitness = 100; // Base fitness
    
    // Penalize conflicts
    const conflicts = this.detectConflicts(solution.timeSlots, [], []);
    fitness -= conflicts.length * 10;
    
    // Reward preferred time slots
    const preferredSlots = solution.timeSlots.filter((slot: TimeSlot) => 
      preferences.preferredTimeSlots.includes(`${slot.startTime}-${slot.endTime}`)
    );
    fitness += preferredSlots.length * 5;
    
    // Penalize back-to-back classes if avoided
    if (preferences.avoidBackToBack) {
      const backToBackPenalty = this.calculateBackToBackPenalty(solution.timeSlots);
      fitness -= backToBackPenalty * 3;
    }
    
    // Reward balanced daily distribution
    const distributionScore = this.calculateDistributionScore(solution.timeSlots);
    fitness += distributionScore;
    
    return fitness;
  }

  private calculateBackToBackPenalty(timeSlots: TimeSlot[]): number {
    let penalty = 0;
    const daySchedules = new Map<string, TimeSlot[]>();
    
    // Group by day
    timeSlots.forEach(slot => {
      if (!daySchedules.has(slot.day)) {
        daySchedules.set(slot.day, []);
      }
      daySchedules.get(slot.day)!.push(slot);
    });
    
    // Check for back-to-back classes
    daySchedules.forEach(daySlots => {
      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      for (let i = 0; i < daySlots.length - 1; i++) {
        if (daySlots[i].endTime === daySlots[i + 1].startTime) {
          penalty++;
        }
      }
    });
    
    return penalty;
  }

  private calculateDistributionScore(timeSlots: TimeSlot[]): number {
    const dayDistribution = new Map<string, number>();
    
    timeSlots.forEach(slot => {
      dayDistribution.set(slot.day, (dayDistribution.get(slot.day) || 0) + 1);
    });
    
    const values = Array.from(dayDistribution.values());
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    // Lower variance = better distribution = higher score
    return Math.max(0, 10 - variance);
  }

  private optimizeGlobalSchedule(
    timetables: GeneratedTimetable[],
    params: BatchGenerationParams
  ): GeneratedTimetable[] {
    // Global optimization: resolve cross-timetable conflicts
    const optimizedTimetables = [...timetables];
    
    // Check for faculty conflicts across timetables
    const facultySchedules = new Map<string, TimeSlot[]>();
    
    optimizedTimetables.forEach(timetable => {
      timetable.timeSlots.forEach(slot => {
        if (!facultySchedules.has(slot.facultyId)) {
          facultySchedules.set(slot.facultyId, []);
        }
        facultySchedules.get(slot.facultyId)!.push({
          ...slot,
          timetableId: timetable.id
        });
      });
    });
    
    // Resolve faculty conflicts
    facultySchedules.forEach((slots, facultyId) => {
      const conflicts = this.findTimeConflicts(slots);
      
      conflicts.forEach(conflictGroup => {
        // Keep the highest priority slot, reschedule others
        const prioritySlot = conflictGroup.reduce((highest, current) => {
          const currentTimetable = optimizedTimetables.find(t => t.id === (current as any).timetableId);
          const highestTimetable = optimizedTimetables.find(t => t.id === (highest as any).timetableId);
          
          return (currentTimetable?.score || 0) > (highestTimetable?.score || 0) ? current : highest;
        });
        
        conflictGroup.forEach(slot => {
          if (slot.id !== prioritySlot.id) {
            this.rescheduleSlot(slot, optimizedTimetables, params);
          }
        });
      });
    });
    
    // Recalculate scores after optimization
    optimizedTimetables.forEach(timetable => {
      timetable.conflicts = this.detectConflicts(timetable.timeSlots, params.faculty, params.rooms);
      timetable.score = this.calculateTimetableScore(timetable.timeSlots, timetable.conflicts, params.preferences);
      timetable.efficiency = this.calculateEfficiency(timetable.timeSlots, params.courses);
    });
    
    return optimizedTimetables;
  }

  private findTimeConflicts(slots: TimeSlot[]): TimeSlot[][] {
    const conflicts: TimeSlot[][] = [];
    const processed = new Set<string>();
    
    slots.forEach(slot => {
      if (processed.has(slot.id)) return;
      
      const conflictGroup = slots.filter(otherSlot => 
        otherSlot.day === slot.day && 
        otherSlot.startTime === slot.startTime &&
        otherSlot.id !== slot.id
      );
      
      if (conflictGroup.length > 0) {
        conflictGroup.push(slot);
        conflicts.push(conflictGroup);
        conflictGroup.forEach(s => processed.add(s.id));
      }
    });
    
    return conflicts;
  }

  private rescheduleSlot(
    slot: TimeSlot,
    timetables: GeneratedTimetable[],
    params: BatchGenerationParams
  ): void {
    const timetable = timetables.find(t => t.timeSlots.some(s => s.id === slot.id));
    if (!timetable) return;
    
    // Find alternative time slots
    for (const day of this.days) {
      for (const timeSlot of this.timeSlots) {
        const [startTime, endTime] = timeSlot.split('-');
        
        // Check if this slot is available
        const hasConflict = timetable.timeSlots.some(existingSlot =>
          existingSlot.day === day &&
          existingSlot.startTime === startTime &&
          existingSlot.id !== slot.id &&
          (existingSlot.facultyId === slot.facultyId || existingSlot.roomId === slot.roomId)
        );
        
        if (!hasConflict) {
          // Update the slot
          const slotIndex = timetable.timeSlots.findIndex(s => s.id === slot.id);
          if (slotIndex !== -1) {
            timetable.timeSlots[slotIndex] = {
              ...slot,
              day,
              startTime,
              endTime
            };
          }
          return;
        }
      }
    }
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

  private calculateEfficiency(timeSlots: TimeSlot[], courses: Course[]): number {
    const totalRequiredHours = courses.reduce((sum, course) => sum + course.duration, 0);
    const scheduledHours = timeSlots.length;
    
    return totalRequiredHours > 0 ? Math.min(100, (scheduledHours / totalRequiredHours) * 100) : 0;
  }
}