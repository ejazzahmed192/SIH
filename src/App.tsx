import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TimetableProvider, useTimetable } from './contexts/TimetableContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import Generator from './components/Generator';
import Timetables from './components/Timetables';
import Export from './components/Export';

function AppContent() {
  const { dispatch } = useTimetable();

  useEffect(() => {
    // Initialize with sample data for demonstration
    const sampleCourses = [
      {
        id: 'course-1',
        code: 'CS101',
        name: 'Introduction to Computer Science',
        credits: 4,
        type: 'theory' as const,
        program: 'FYUP' as const,
        semester: 1,
        duration: 3,
        prerequisites: [],
      },
      {
        id: 'course-2',
        code: 'CS102',
        name: 'Programming Lab',
        credits: 2,
        type: 'lab' as const,
        program: 'FYUP' as const,
        semester: 1,
        duration: 2,
        prerequisites: [],
      },
      {
        id: 'course-3',
        code: 'ED201',
        name: 'Educational Psychology',
        credits: 3,
        type: 'theory' as const,
        program: 'B.Ed' as const,
        semester: 2,
        duration: 3,
        prerequisites: [],
      },
      {
        id: 'course-4',
        code: 'ED202',
        name: 'Teaching Practice',
        credits: 4,
        type: 'teaching-practice' as const,
        program: 'B.Ed' as const,
        semester: 2,
        duration: 4,
        prerequisites: [],
      },
    ];

    const sampleFaculty = [
      {
        id: 'faculty-1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        department: 'Computer Science',
        specialization: ['Programming', 'Algorithms', 'Data Structures'],
        maxHoursPerWeek: 20,
        availability: {
          Monday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
          Tuesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
          Wednesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
          Thursday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
          Friday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
        },
        assignedCourses: ['course-1', 'course-2'],
      },
      {
        id: 'faculty-2',
        name: 'Prof. Michael Chen',
        email: 'michael.chen@university.edu',
        department: 'Education',
        specialization: ['Educational Psychology', 'Teaching Methodology'],
        maxHoursPerWeek: 18,
        availability: {
          Monday: { '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true },
          Tuesday: { '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true },
          Wednesday: { '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true },
          Thursday: { '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true },
          Friday: { '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true },
        },
        assignedCourses: ['course-3', 'course-4'],
      },
    ];

    const sampleRooms = [
      {
        id: 'room-1',
        name: 'CS Lab 1',
        type: 'lab' as const,
        capacity: 30,
        equipment: ['Computers', 'Projector', 'Whiteboard'],
        availability: {
          Monday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
          Tuesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
          Wednesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
          Thursday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
          Friday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
        },
      },
      {
        id: 'room-2',
        name: 'Lecture Hall A',
        type: 'classroom' as const,
        capacity: 100,
        equipment: ['Projector', 'Audio System', 'Whiteboard'],
        availability: {
          Monday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
          Tuesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
          Wednesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
          Thursday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
          Friday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true },
        },
      },
    ];

    const sampleStudents = [
      {
        id: 'student-1',
        name: 'Alice Smith',
        email: 'alice.smith@student.edu',
        program: 'FYUP' as const,
        semester: 1,
        selectedCourses: ['course-1', 'course-2'],
      },
      {
        id: 'student-2',
        name: 'Bob Johnson',
        email: 'bob.johnson@student.edu',
        program: 'B.Ed' as const,
        semester: 2,
        selectedCourses: ['course-3', 'course-4'],
      },
    ];

    dispatch({ type: 'SET_COURSES', payload: sampleCourses });
    dispatch({ type: 'SET_FACULTY', payload: sampleFaculty });
    dispatch({ type: 'SET_ROOMS', payload: sampleRooms });
    dispatch({ type: 'SET_STUDENTS', payload: sampleStudents });
  }, [dispatch]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/faculty" element={<div className="text-center py-12 text-gray-500">Faculty management coming soon...</div>} />
        <Route path="/rooms" element={<div className="text-center py-12 text-gray-500">Room management coming soon...</div>} />
        <Route path="/students" element={<div className="text-center py-12 text-gray-500">Student management coming soon...</div>} />
        <Route path="/timetables" element={<Timetables />} />
        <Route path="/generator" element={<Generator />} />
        <Route path="/export" element={<Export />} />
        <Route path="/settings" element={<div className="text-center py-12 text-gray-500">Settings coming soon...</div>} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <TimetableProvider>
      <Router>
        <AppContent />
      </Router>
    </TimetableProvider>
  );
}

export default App;