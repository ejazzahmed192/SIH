import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { TimetableGenerator, GenerationParams } from '../utils/timetableGenerator';
import { Brain, Settings, Play, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function Generator() {
  const { state, dispatch } = useTimetable();
  const [params, setParams] = useState<Partial<GenerationParams>>({
    program: 'FYUP',
    semester: 1,
    preferences: {
      preferredTimeSlots: ['09:00-10:00', '10:00-11:00', '11:00-12:00'],
      avoidBackToBack: true,
      maxHoursPerDay: 6,
    },
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ timeSlots: any[]; conflicts: any[] } | null>(null);

  const programs = ['FYUP', 'B.Ed', 'M.Ed', 'ITEP'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  const handleGenerate = async () => {
    if (!params.program || !params.semester) {
      alert('Please select program and semester');
      return;
    }

    setGenerating(true);
    
    try {
      const generator = new TimetableGenerator();
      const generationParams: GenerationParams = {
        courses: state.courses,
        faculty: state.faculty,
        rooms: state.rooms,
        students: state.students,
        program: params.program,
        semester: params.semester,
        preferences: params.preferences || {
          preferredTimeSlots: [],
          avoidBackToBack: true,
          maxHoursPerDay: 6,
        },
      };

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = generator.generateTimetable(generationParams);
      setResult(result);
      
      // Create new timetable
      const newTimetable = {
        id: `timetable-${Date.now()}`,
        name: `${params.program} Semester ${params.semester} Timetable`,
        program: params.program,
        semester: params.semester,
        academicYear: '2024-25',
        timeSlots: result.timeSlots,
        conflicts: result.conflicts,
        lastModified: new Date(),
      };

      dispatch({ type: 'ADD_TIMETABLE', payload: newTimetable });
      dispatch({ type: 'SET_ACTIVE_TIMETABLE', payload: newTimetable });
      
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate timetable. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="h-8 w-8 mr-3 text-blue-600" />
            AI Timetable Generator
          </h1>
          <p className="text-gray-600 mt-1">Generate optimized timetables using AI algorithms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <Settings className="h-5 w-5 mr-2 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Generation Parameters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program
                </label>
                <select
                  value={params.program || ''}
                  onChange={(e) => setParams({ ...params, program: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Program</option>
                  {programs.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  value={params.semester || ''}
                  onChange={(e) => setParams({ ...params, semester: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Semester</option>
                  {semesters.map((semester) => (
                    <option key={semester} value={semester}>
                      Semester {semester}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time Slots
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <label key={slot} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={params.preferences?.preferredTimeSlots?.includes(slot) || false}
                      onChange={(e) => {
                        const currentSlots = params.preferences?.preferredTimeSlots || [];
                        const newSlots = e.target.checked
                          ? [...currentSlots, slot]
                          : currentSlots.filter(s => s !== slot);
                        setParams({
                          ...params,
                          preferences: {
                            ...params.preferences,
                            preferredTimeSlots: newSlots,
                          },
                        });
                      }}
                      className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{slot}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={params.preferences?.avoidBackToBack || false}
                    onChange={(e) => setParams({
                      ...params,
                      preferences: {
                        ...params.preferences,
                        avoidBackToBack: e.target.checked,
                      },
                    })}
                    className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Avoid back-to-back classes</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max hours per day
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={params.preferences?.maxHoursPerDay || 6}
                  onChange={(e) => setParams({
                    ...params,
                    preferences: {
                      ...params.preferences,
                      maxHoursPerDay: parseInt(e.target.value),
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleGenerate}
                disabled={generating || !params.program || !params.semester}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {generating ? (
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                {generating ? 'Generating...' : 'Generate Timetable'}
              </button>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available Courses</span>
                <span className="text-sm font-medium text-gray-900">
                  {state.courses.filter(c => c.program === params.program && c.semester === params.semester).length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Faculty Members</span>
                <span className="text-sm font-medium text-gray-900">{state.faculty.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available Rooms</span>
                <span className="text-sm font-medium text-gray-900">{state.rooms.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Students</span>
                <span className="text-sm font-medium text-gray-900">
                  {state.students.filter(s => s.program === params.program && s.semester === params.semester).length}
                </span>
              </div>
            </div>
          </div>

          {result && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Result</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    Generated {result.timeSlots.length} time slots
                  </span>
                </div>
                
                {result.conflicts.length > 0 ? (
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {result.conflicts.length} conflicts detected
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600">No conflicts found</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}