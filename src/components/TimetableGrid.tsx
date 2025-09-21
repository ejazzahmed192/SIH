import React from 'react';
import { useDndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { TimeSlot, Course, Faculty, Room } from '../types';
import DraggableTimeSlot from './DraggableTimeSlot';
import DroppableCell from './DroppableCell';

interface TimetableGridProps {
  timeSlots: TimeSlot[];
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  onSlotUpdate: (slot: TimeSlot) => void;
}

export default function TimetableGrid({
  timeSlots,
  courses,
  faculty,
  rooms,
  onSlotUpdate,
}: TimetableGridProps) {
  const { active } = useDndContext();
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlotHours = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  const getSlotForCell = (day: string, timeSlot: string): TimeSlot | undefined => {
    const startTime = timeSlot.split('-')[0];
    return timeSlots.find(slot => slot.day === day && slot.startTime === startTime);
  };

  const getSlotDetails = (slot: TimeSlot) => {
    const course = courses.find(c => c.id === slot.courseId);
    const facultyMember = faculty.find(f => f.id === slot.facultyId);
    const room = rooms.find(r => r.id === slot.roomId);
    return { course, faculty: facultyMember, room };
  };

  const activeDraggedSlot = active ? timeSlots.find(slot => slot.id === active.id) : null;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Time
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <SortableContext items={timeSlots.map(slot => slot.id)} strategy={rectSortingStrategy}>
              {timeSlotHours.map((timeSlot) => (
                <tr key={timeSlot} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-4 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                    {timeSlot}
                  </td>
                  {days.map((day) => {
                    const slot = getSlotForCell(day, timeSlot);
                    const cellId = `${day}-${timeSlot}`;
                    
                    return (
                      <DroppableCell
                        key={cellId}
                        id={cellId}
                        day={day}
                        timeSlot={timeSlot}
                        onSlotUpdate={onSlotUpdate}
                      >
                        {slot && (
                          <DraggableTimeSlot
                            slot={slot}
                            details={getSlotDetails(slot)}
                            onUpdate={onSlotUpdate}
                          />
                        )}
                      </DroppableCell>
                    );
                  })}
                </tr>
              ))}
            </SortableContext>
          </tbody>
        </table>
      </div>
      
      <DragOverlay>
        {activeDraggedSlot && (
          <div className="bg-blue-100 border border-blue-300 rounded p-2 shadow-lg">
            <div className="text-xs font-medium text-blue-900">
              {getSlotDetails(activeDraggedSlot).course?.code}
            </div>
          </div>
        )}
      </DragOverlay>
    </div>
  );
}