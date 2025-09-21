import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { useTimetable } from '../contexts/TimetableContext';
import TimetableGrid from './TimetableGrid';
import { Calendar, Edit, Eye, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { TimeSlot } from '../types';

export default function Timetables() {
  const { state, dispatch } = useTimetable();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedTimetable, setSelectedTimetable] = useState<string | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !state.activeTimetable) return;
    
    const draggedSlot = state.activeTimetable.timeSlots.find(slot => slot.id === active.id);
    if (!draggedSlot) return;

    // Parse drop target
    const [day, timeSlot] = (over.id as string).split('-');
    const [startTime, endTime] = timeSlot.split('-');
    
    // Update the time slot
    const updatedSlot: TimeSlot = {
      ...draggedSlot,
      day,
      startTime,
      endTime,
    };
    
    dispatch({
      type: 'UPDATE_TIME_SLOT',
      payload: {
        timetableId: state.activeTimetable.id,
        timeSlot: updatedSlot,
      },
    });
  };

  const handleSlotUpdate = (updatedSlot: TimeSlot) => {
    if (!state.activeTimetable) return;
    
    dispatch({
      type: 'UPDATE_TIME_SLOT',
      payload: {
        timetableId: state.activeTimetable.id,
        timeSlot: updatedSlot,
      },
    });
  };

  const handleSelectTimetable = (timetableId: string) => {
    const timetable = state.timetables.find(t => t.id === timetableId);
    dispatch({ type: 'SET_ACTIVE_TIMETABLE', payload: timetable || null });
    setSelectedTimetable(timetableId);
    setViewMode('grid');
  };

  const handleDeleteTimetable = (timetableId: string) => {
    if (confirm('Are you sure you want to delete this timetable?')) {
      dispatch({ type: 'DELETE_TIMETABLE', payload: timetableId });
      if (state.activeTimetable?.id === timetableId) {
        dispatch({ type: 'SET_ACTIVE_TIMETABLE', payload: null });
        setSelectedTimetable(null);
        setViewMode('list');
      }
    }
  };

  if (viewMode === 'grid' && state.activeTimetable) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setViewMode('list')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2"
            >
              ← Back to Timetables
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {state.activeTimetable.name}
            </h1>
            <p className="text-gray-600 mt-1">
              {state.activeTimetable.program} - Semester {state.activeTimetable.semester}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {state.activeTimetable.conflicts.length > 0 && (
              <div className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {state.activeTimetable.conflicts.length} conflicts
              </div>
            )}
          </div>
        </div>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <TimetableGrid
            timeSlots={state.activeTimetable.timeSlots}
            courses={state.courses}
            faculty={state.faculty}
            rooms={state.rooms}
            onSlotUpdate={handleSlotUpdate}
          />
        </DndContext>

        {state.activeTimetable.conflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-3">Conflicts Detected</h3>
            <div className="space-y-2">
              {state.activeTimetable.conflicts.map((conflict) => (
                <div key={conflict.id} className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-800">{conflict.description}</p>
                    <p className="text-xs text-red-600 capitalize">
                      {conflict.type} conflict - {conflict.severity} priority
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Timetables</h1>
          <p className="text-gray-600 mt-1">Manage and view generated timetables</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200">
          <Plus className="h-5 w-5 mr-2" />
          Create Timetable
        </button>
      </div>

      {state.timetables.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No timetables created yet</h3>
          <p className="text-gray-600 mb-6">
            Start by generating your first timetable using the AI Generator.
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Go to AI Generator
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.timetables.map((timetable) => (
            <div key={timetable.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-600">
                      {timetable.program}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Sem {timetable.semester}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                  {timetable.name}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{timetable.timeSlots.length} sessions</span>
                  <span>{new Date(timetable.lastModified).toLocaleDateString()}</span>
                </div>
                
                {timetable.conflicts.length > 0 && (
                  <div className="flex items-center mb-4 p-2 bg-red-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">
                      {timetable.conflicts.length} conflicts
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleSelectTimetable(timetable.id)}
                    className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTimetable(timetable.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}