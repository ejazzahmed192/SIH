import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { TimetableData, TimeSlot, Course, Faculty, Room } from '../types';

export class ExportUtils {
  static exportToPDF(
    timetable: TimetableData,
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[]
  ): void {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text(`${timetable.name} - ${timetable.program}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Semester ${timetable.semester} | Academic Year ${timetable.academicYear}`, 20, 35);
    
    // Headers
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', 
                      '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];
    
    let yPos = 50;
    
    // Table headers
    doc.setFontSize(10);
    doc.text('Time', 20, yPos);
    days.forEach((day, index) => {
      doc.text(day, 60 + (index * 25), yPos);
    });
    
    yPos += 10;
    
    // Table content
    timeSlots.forEach(timeSlot => {
      doc.text(timeSlot, 20, yPos);
      
      days.forEach((day, dayIndex) => {
        const slot = timetable.timeSlots.find(
          s => s.day === day && s.startTime === timeSlot.split('-')[0]
        );
        
        if (slot) {
          const course = courses.find(c => c.id === slot.courseId);
          const facultyMember = faculty.find(f => f.id === slot.facultyId);
          const room = rooms.find(r => r.id === slot.roomId);
          
          const cellText = `${course?.code || ''}
${facultyMember?.name?.split(' ')[0] || ''}
${room?.name || ''}`;
          
          doc.setFontSize(8);
          doc.text(cellText, 60 + (dayIndex * 25), yPos);
          doc.setFontSize(10);
        }
      });
      
      yPos += 20;
      
      if (yPos > 250) { // New page if needed
        doc.addPage();
        yPos = 30;
      }
    });
    
    doc.save(`${timetable.name.replace(/\s+/g, '_')}_timetable.pdf`);
  }

  static exportToExcel(
    timetable: TimetableData,
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[]
  ): void {
    const workbook = XLSX.utils.book_new();
    
    // Create main timetable sheet
    const timetableData = this.createTimetableMatrix(timetable, courses, faculty, rooms);
    const timetableSheet = XLSX.utils.aoa_to_sheet(timetableData);
    XLSX.utils.book_append_sheet(workbook, timetableSheet, 'Timetable');
    
    // Create courses sheet
    const coursesData = [
      ['Course Code', 'Course Name', 'Credits', 'Type', 'Program', 'Semester'],
      ...courses.map(c => [c.code, c.name, c.credits, c.type, c.program, c.semester])
    ];
    const coursesSheet = XLSX.utils.aoa_to_sheet(coursesData);
    XLSX.utils.book_append_sheet(workbook, coursesSheet, 'Courses');
    
    // Create faculty sheet
    const facultyData = [
      ['Name', 'Email', 'Department', 'Specialization', 'Max Hours/Week'],
      ...faculty.map(f => [f.name, f.email, f.department, f.specialization.join(', '), f.maxHoursPerWeek])
    ];
    const facultySheet = XLSX.utils.aoa_to_sheet(facultyData);
    XLSX.utils.book_append_sheet(workbook, facultySheet, 'Faculty');
    
    // Create rooms sheet
    const roomsData = [
      ['Room Name', 'Type', 'Capacity', 'Equipment'],
      ...rooms.map(r => [r.name, r.type, r.capacity, r.equipment.join(', ')])
    ];
    const roomsSheet = XLSX.utils.aoa_to_sheet(roomsData);
    XLSX.utils.book_append_sheet(workbook, roomsSheet, 'Rooms');
    
    XLSX.writeFile(workbook, `${timetable.name.replace(/\s+/g, '_')}_timetable.xlsx`);
  }

  private static createTimetableMatrix(
    timetable: TimetableData,
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[]
  ): any[][] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
                      '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];
    
    const matrix: any[][] = [];
    
    // Header row
    matrix.push(['Time Slot', ...days]);
    
    // Data rows
    timeSlots.forEach(timeSlot => {
      const row = [timeSlot];
      
      days.forEach(day => {
        const slot = timetable.timeSlots.find(
          s => s.day === day && s.startTime === timeSlot.split('-')[0]
        );
        
        if (slot) {
          const course = courses.find(c => c.id === slot.courseId);
          const facultyMember = faculty.find(f => f.id === slot.facultyId);
          const room = rooms.find(r => r.id === slot.roomId);
          
          row.push(`${course?.code || ''} | ${facultyMember?.name || ''} | ${room?.name || ''}`);
        } else {
          row.push('');
        }
      });
      
      matrix.push(row);
    });
    
    return matrix;
  }
}