import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TimeSlot } from '../types';

interface DroppableCellProps {
  id: string;
  day: string;
  timeSlot: string;
  children?: React.ReactNode;
  onSlotUpdate: (slot: TimeSlot) => void;
}

export default function DroppableCell({ 
  id, 
  day, 
  timeSlot, 
  children, 
  onSlotUpdate 
}: DroppableCellProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      day,
      timeSlot,
    },
  });

  return (
    <td
      ref={setNodeRef}
      className={`px-4 py-4 align-top transition-colors duration-200 ${
        isOver 
          ? 'bg-blue-50 border-2 border-dashed border-blue-300' 
          : 'border-r border-gray-200'
      }`}
      style={{ minHeight: '100px', height: 'auto' }}
    >
      <div className="min-h-[80px]">
        {children}
      </div>
    </td>
  );
}