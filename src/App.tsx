import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { TimetableProvider, useTimetable } from './contexts/TimetableContext';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import Faculty from './components/Faculty';
import Rooms from './components/Rooms';
import Students from './components/Students';
import Generator from './components/Generator';
import BatchGenerator from './components/BatchGenerator';
import Timetables from './components/Timetables';
import Export from './components/Export';
import Settings from './components/Settings';

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
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/courses" element={<Layout><Courses /></Layout>} />
      <Route path="/faculty" element={<Layout><Faculty /></Layout>} />
      <Route path="/rooms" element={<Layout><Rooms /></Layout>} />
      <Route path="/students" element={<Layout><Students /></Layout>} />
      <Route path="/timetables" element={<Layout><Timetables /></Layout>} />
      <Route path="/generator" element={<Layout><Generator /></Layout>} />
      <Route path="/batch-generator" element={<Layout><BatchGenerator /></Layout>} />
      <Route path="/export" element={<Layout><Export /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TimetableProvider>
        <Router>
          <AppContent />
        </Router>
      </TimetableProvider>
    </ThemeProvider>
  );
}

export default App;