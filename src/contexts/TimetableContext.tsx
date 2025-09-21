import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { TimetableData, Course, Faculty, Room, Student, TimeSlot, Conflict } from '../types';

interface TimetableState {
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  students: Student[];
  timetables: TimetableData[];
  activeTimetable: TimetableData | null;
  loading: boolean;
  conflicts: Conflict[];
}

type TimetableAction =
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'SET_FACULTY'; payload: Faculty[] }
  | { type: 'ADD_FACULTY'; payload: Faculty }
  | { type: 'UPDATE_FACULTY'; payload: Faculty }
  | { type: 'DELETE_FACULTY'; payload: string }
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'DELETE_ROOM'; payload: string }
  | { type: 'SET_STUDENTS'; payload: Student[] }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'SET_TIMETABLES'; payload: TimetableData[] }
  | { type: 'ADD_TIMETABLE'; payload: TimetableData }
  | { type: 'UPDATE_TIMETABLE'; payload: TimetableData }
  | { type: 'DELETE_TIMETABLE'; payload: string }
  | { type: 'SET_ACTIVE_TIMETABLE'; payload: TimetableData | null }
  | { type: 'UPDATE_TIME_SLOT'; payload: { timetableId: string; timeSlot: TimeSlot } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CONFLICTS'; payload: Conflict[] };

const initialState: TimetableState = {
  courses: [],
  faculty: [],
  rooms: [],
  students: [],
  timetables: [],
  activeTimetable: null,
  loading: false,
  conflicts: [],
};

function timetableReducer(state: TimetableState, action: TimetableAction): TimetableState {
  switch (action.type) {
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.payload.id ? action.payload : course
        ),
      };
    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(course => course.id !== action.payload),
      };
    case 'SET_FACULTY':
      return { ...state, faculty: action.payload };
    case 'ADD_FACULTY':
      return { ...state, faculty: [...state.faculty, action.payload] };
    case 'UPDATE_FACULTY':
      return {
        ...state,
        faculty: state.faculty.map(f =>
          f.id === action.payload.id ? action.payload : f
        ),
      };
    case 'DELETE_FACULTY':
      return {
        ...state,
        faculty: state.faculty.filter(f => f.id !== action.payload),
      };
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(room =>
          room.id === action.payload.id ? action.payload : room
        ),
      };
    case 'DELETE_ROOM':
      return {
        ...state,
        rooms: state.rooms.filter(room => room.id !== action.payload),
      };
    case 'SET_STUDENTS':
      return { ...state, students: action.payload };
    case 'ADD_STUDENT':
      return { ...state, students: [...state.students, action.payload] };
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(student =>
          student.id === action.payload.id ? action.payload : student
        ),
      };
    case 'DELETE_STUDENT':
      return {
        ...state,
        students: state.students.filter(student => student.id !== action.payload),
      };
    case 'SET_TIMETABLES':
      return { ...state, timetables: action.payload };
    case 'ADD_TIMETABLE':
      return { ...state, timetables: [...state.timetables, action.payload] };
    case 'UPDATE_TIMETABLE':
      return {
        ...state,
        timetables: state.timetables.map(timetable =>
          timetable.id === action.payload.id ? action.payload : timetable
        ),
      };
    case 'DELETE_TIMETABLE':
      return {
        ...state,
        timetables: state.timetables.filter(timetable => timetable.id !== action.payload),
      };
    case 'SET_ACTIVE_TIMETABLE':
      return { ...state, activeTimetable: action.payload };
    case 'UPDATE_TIME_SLOT':
      const updatedTimetables = state.timetables.map(timetable => {
        if (timetable.id === action.payload.timetableId) {
          const updatedTimeSlots = timetable.timeSlots.map(slot =>
            slot.id === action.payload.timeSlot.id ? action.payload.timeSlot : slot
          );
          return { ...timetable, timeSlots: updatedTimeSlots };
        }
        return timetable;
      });
      return {
        ...state,
        timetables: updatedTimetables,
        activeTimetable: state.activeTimetable?.id === action.payload.timetableId
          ? {
              ...state.activeTimetable,
              timeSlots: state.activeTimetable.timeSlots.map(slot =>
                slot.id === action.payload.timeSlot.id ? action.payload.timeSlot : slot
              ),
            }
          : state.activeTimetable,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CONFLICTS':
      return { ...state, conflicts: action.payload };
    default:
      return state;
  }
}

const TimetableContext = createContext<{
  state: TimetableState;
  dispatch: React.Dispatch<TimetableAction>;
} | null>(null);

export function TimetableProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timetableReducer, initialState);

  return (
    <TimetableContext.Provider value={{ state, dispatch }}>
      {children}
    </TimetableContext.Provider>
  );
}

export function useTimetable() {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error('useTimetable must be used within a TimetableProvider');
  }
  return context;
}