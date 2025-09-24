import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { ORToolsTimetableGenerator, ORToolsBatchGenerationParams } from '../utils/orToolsTimetableGenerator';
import { Brain, Settings, Play, AlertCircle, CheckCircle, Loader, Zap, Target } from 'lucide-react';

export default function BatchGenerator() {
  const { state, dispatch } = useTimetable();
  const [params, setParams] = useState<Partial<ORToolsBatchGenerationParams>>({
    programs: ['FYUP'],
    semesters: [1],
    preferences: {
      preferredTimeSlots: ['09:00-10:00', '10:00-11:00', '11:00-12:00'],
      avoidBackToBack: true,
      maxHoursPerDay: 6,
      prioritizeCore: true,
      balanceWorkload: true,
    },
  });
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  const programs = ['FYUP', 'B.Ed', 'M.Ed', 'ITEP'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  const handleGenerate = async () => {
    if (!params.programs?.length || !params.semesters?.length) {
      alert('Please select at least one program and semester');
      return;
    }

    setGenerating(true);
    setProgress(0);
    
    try {
      const generator = new ORToolsTimetableGenerator();
      const generationParams: ORToolsBatchGenerationParams = {
        programs: params.programs,
        semesters: params.semesters,
        courses: state.courses,
        faculty: state.faculty,
        rooms: state.rooms,
        students: state.students,
        preferences: params.preferences || {
          preferredTimeSlots: [],
          avoidBackToBack: true,
          maxHoursPerDay: 6,
          prioritizeCore: true,
          balanceWorkload: true,
        },
      };

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const generatedTimetables = await generator.generateBatchTimetables(generationParams);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setResults(generatedTimetables);
      
      // Add all generated timetables to state
      generatedTimetables.forEach(timetable => {
        const newTimetable = {
          id: timetable.id,
          name: timetable.name,
          program: timetable.program,
          semester: timetable.semester,
          academicYear: '2024-25',
          timeSlots: timetable.timeSlots,
          conflicts: timetable.conflicts,
          lastModified: new Date(),
        };
        dispatch({ type: 'ADD_TIMETABLE', payload: newTimetable });
      });
      
    } catch (error) {
      console.error('Batch generation failed:', error);
      alert('Failed to generate timetables. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const toggleProgram = (program: string) => {
    const currentPrograms = params.programs || [];
    setParams({
      ...params,
      programs: currentPrograms.includes(program)
        ? currentPrograms.filter(p => p !== program)
        : [...currentPrograms, program]
    });
  };

  const toggleSemester = (semester: number) => {
    const currentSemesters = params.semesters || [];
    setParams({
      ...params,
      semesters: currentSemesters.includes(semester)
        ? currentSemesters.filter(s => s !== semester)
        : [...currentSemesters, semester]
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Zap className="h-8 w-8 mr-3 text-blue-600" />
            AI Batch Timetable Generator
          </h1>
          <p className="text-gray-600 mt-1">Generate optimized timetables for multiple programs and semesters simultaneously</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
              <Settings className="h-5 w-5 mr-2 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Batch Generation Parameters</h2>
            </div>

            <div className="space-y-6">
              {/* Program Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Programs
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {programs.map((program) => (
                    <label key={program} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={params.programs?.includes(program) || false}
                        onChange={() => toggleProgram(program)}
                        className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{program}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Semester Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Semesters
                </label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {semesters.map((semester) => (
                    <label key={semester} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={params.semesters?.includes(semester) || false}
                        onChange={() => toggleSemester(semester)}
                        className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Sem {semester}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* AI Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  AI Optimization Preferences
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={params.preferences?.prioritizeCore || false}
                      onChange={(e) => setParams({
                        ...params,
                        preferences: {
                          ...params.preferences,
                          prioritizeCore: e.target.checked,
                        },
                      })}
                      className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Prioritize core courses</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={params.preferences?.balanceWorkload || false}
                      onChange={(e) => setParams({
                        ...params,
                        preferences: {
                          ...params.preferences,
                          balanceWorkload: e.target.checked,
                        },
                      })}
                      className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Balance faculty workload</span>
                  </label>
                  
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
              </div>

              {/* Preferred Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
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
                      <span className="text-xs text-gray-700">{slot}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Max Hours Per Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max hours per day: {params.preferences?.maxHoursPerDay || 6}
                </label>
                <input
                  type="range"
                  min="4"
                  max="8"
                  value={params.preferences?.maxHoursPerDay || 6}
                  onChange={(e) => setParams({
                    ...params,
                    preferences: {
                      ...params.preferences,
                      maxHoursPerDay: parseInt(e.target.value),
                    },
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleGenerate}
                disabled={generating || !params.programs?.length || !params.semesters?.length}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {generating ? (
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Play className="h-5 w-5 mr-2" />
                )}
                {generating ? 'Generating...' : 'Generate All Timetables'}
              </button>
            </div>

            {/* Progress Bar */}
            {generating && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>AI Processing Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Selected Programs</span>
                <span className="text-sm font-medium text-gray-900">
                  {params.programs?.length || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Selected Semesters</span>
                <span className="text-sm font-medium text-gray-900">
                  {params.semesters?.length || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Combinations</span>
                <span className="text-sm font-medium text-gray-900">
                  {(params.programs?.length || 0) * (params.semesters?.length || 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available Faculty</span>
                <span className="text-sm font-medium text-gray-900">{state.faculty.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available Rooms</span>
                <span className="text-sm font-medium text-gray-900">{state.rooms.length}</span>
              </div>
            </div>
          </div>

          {results.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Results</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    Optimized using Google OR-Tools CP-SAT solver with global optimization
                  </span>
                </div>
                
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{result.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Score: {result.score}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {result.solutionTime}ms
                        </span>
                        {result.conflicts.length === 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}