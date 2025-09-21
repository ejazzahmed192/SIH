import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TimeSlot, Course, Faculty, Room } from '../types';
import { Clock, User, MapPin, GripVertical } from 'lucide-react';

interface DraggableTimeSlotProps {
  slot: TimeSlot;
  details: {
    course?: Course;
    faculty?: Faculty;
    room?: Room;
  };
  onUpdate: (slot: TimeSlot) => void;
}

export default function DraggableTimeSlot({ slot, details, onUpdate }: DraggableTimeSlotProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'theory': 'bg-blue-100 border-blue-300 text-blue-800',
      'practical': 'bg-green-100 border-green-300 text-green-800',
      'lab': 'bg-orange-100 border-orange-300 text-orange-800',
      'project': 'bg-purple-100 border-purple-300 text-purple-800',
      'fieldwork': 'bg-teal-100 border-teal-300 text-teal-800',
      'internship': 'bg-indigo-100 border-indigo-300 text-indigo-800',
      'teaching-practice': 'bg-pink-100 border-pink-300 text-pink-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded border-2 cursor-move transition-all duration-200 hover:shadow-md ${getTypeColor(slot.type)}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1">
            <div className="text-sm font-semibold truncate">
              {details.course?.code || 'Unknown Course'}
            </div>
            <GripVertical className="h-4 w-4 ml-2 opacity-50" />
          </div>
          
          <div className="text-xs text-gray-600 mb-2 truncate">
            {details.course?.name || 'Course name not found'}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-xs">
              <User className="h-3 w-3 mr-1" />
              <span className="truncate">{details.faculty?.name || 'TBA'}</span>
            </div>
            
            <div className="flex items-center text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{details.room?.name || 'TBA'}</span>
            </div>
            
            <div className="flex items-center text-xs">
              <Clock className="h-3 w-3 mr-1" />
              <span>{slot.startTime}-{slot.endTime}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-medium px-2 py-1 rounded bg-white bg-opacity-50 capitalize">
          {slot.type.replace('-', ' ')}
        </span>
        <span className="text-xs text-gray-500">
          {slot.studentGroups.length} groups
        </span>
      </div>
    </div>
  );
}