import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { Course } from '../types';
import { Upload, Download, BookOpen, Plus, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface BulkCourseImportProps {
  onClose: () => void;
}

interface CourseTemplate {
  code: string;
  name: string;
  credits: number;
  type: 'theory' | 'practical' | 'lab' | 'project' | 'fieldwork' | 'internship' | 'teaching-practice';
  program: 'FYUP' | 'B.Ed' | 'M.Ed' | 'ITEP';
  semester: number;
  duration: number;
  prerequisites: string[];
}

export default function BulkCourseImport({ onClose }: BulkCourseImportProps) {
  const { state, dispatch } = useTimetable();
  const [importMethod, setImportMethod] = useState<'csv' | 'template'>('template');
  const [courses, setCourses] = useState<CourseTemplate[]>([]);
  const [csvData, setCsvData] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);

  // Template configuration
  const [templateConfig, setTemplateConfig] = useState({
    program: 'FYUP' as const,
    semester: 1,
    type: 'theory' as const,
    count: 10,
    credits: 3,
    duration: 3
  });

  const programs = ['FYUP', 'B.Ed', 'M.Ed', 'ITEP'];
  const courseTypes = ['theory', 'practical', 'lab', 'project', 'fieldwork', 'internship', 'teaching-practice'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleTemplateGeneration = () => {
    const newCourses: CourseTemplate[] = [];
    
    for (let i = 1; i <= templateConfig.count; i++) {
      const courseNumber = i.toString().padStart(3, '0');
      newCourses.push({
        code: `${templateConfig.program}${templateConfig.semester}${courseNumber}`,
        name: `${templateConfig.program} Course ${courseNumber}`,
        credits: templateConfig.credits,
        type: templateConfig.type,
        program: templateConfig.program,
        semester: templateConfig.semester,
        duration: templateConfig.duration,
        prerequisites: []
      });
    }
    
    setCourses(newCourses);
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
      parseCsvData(text);
    };
    reader.readAsText(file);
  };

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const parsedCourses: CourseTemplate[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length >= 7) {
        const prerequisites = values[7] ? values[7].split(';').map(p => p.trim()) : [];
        
        parsedCourses.push({
          code: values[0] || `COURSE${i}`,
          name: values[1] || `Course ${i}`,
          credits: parseInt(values[2]) || 3,
          type: (values[3] as any) || 'theory',
          program: (values[4] as any) || 'FYUP',
          semester: parseInt(values[5]) || 1,
          duration: parseInt(values[6]) || 3,
          prerequisites: prerequisites
        });
      }
    }
    
    setCourses(parsedCourses);
  };

  const handleBulkImport = async () => {
    setImporting(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      for (const courseData of courses) {
        try {
          // Validate course data
          if (!courseData.code || !courseData.name) {
            errors.push(`Invalid data for course: ${courseData.code || 'Unknown'}`);
            continue;
          }

          // Check if course already exists
          const existingCourse = state.courses.find(c => c.code === courseData.code);
          if (existingCourse) {
            errors.push(`Course with code ${courseData.code} already exists`);
            continue;
          }

          const newCourse: Course = {
            id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            code: courseData.code,
            name: courseData.name,
            credits: courseData.credits,
            type: courseData.type,
            program: courseData.program,
            semester: courseData.semester,
            duration: courseData.duration,
            prerequisites: courseData.prerequisites
          };

          dispatch({ type: 'ADD_COURSE', payload: newCourse });
          successCount++;
        } catch (error) {
          errors.push(`Error adding course ${courseData.code}: ${error}`);
        }
      }

      setResults({ success: successCount, errors });
    } catch (error) {
      setResults({ success: 0, errors: [`Import failed: ${error}`] });
    } finally {
      setImporting(false);
    }
  };

  const downloadCsvTemplate = () => {
    const headers = ['Code', 'Name', 'Credits', 'Type', 'Program', 'Semester', 'Duration', 'Prerequisites (semicolon separated)'];
    const sampleData = [
      'CS101,Introduction to Computer Science,4,theory,FYUP,1,3,',
      'CS102,Programming Lab,2,lab,FYUP,1,2,CS101',
      'ED201,Educational Psychology,3,theory,B.Ed,2,3,'
    ];
    
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const updateCourse = (index: number, field: keyof CourseTemplate, value: any) => {
    const updatedCourses = [...courses];
    updatedCourses[index] = { ...updatedCourses[index], [field]: value };
    setCourses(updatedCourses);
  };

  const removeCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Bulk Course Import</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Import Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Import Method</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setImportMethod('template')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  importMethod === 'template'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">Template Generator</div>
                  <div className="text-sm text-gray-500">Generate courses with predefined configurations</div>
                </div>
              </button>

              <button
                onClick={() => setImportMethod('csv')}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  importMethod === 'csv'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Upload className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">CSV Upload</div>
                  <div className="text-sm text-gray-500">Upload course data from CSV file</div>
                </div>
              </button>
            </div>
          </div>

          {/* Template Generator */}
          {importMethod === 'template' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                    <select
                      value={templateConfig.program}
                      onChange={(e) => setTemplateConfig(prev => ({ ...prev, program: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {programs.map(program => (
                        <option key={program} value={program}>{program}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <select
                      value={templateConfig.semester}
                      onChange={(e) => setTemplateConfig(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {semesters.map(semester => (
                        <option key={semester} value={semester}>Semester {semester}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                    <select
                      value={templateConfig.type}
                      onChange={(e) => setTemplateConfig(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {courseTypes.map(type => (
                        <option key={type} value={type} className="capitalize">
                          {type.replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Count</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={templateConfig.count}
                      onChange={(e) => setTemplateConfig(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={templateConfig.credits}
                      onChange={(e) => setTemplateConfig(prev => ({ ...prev, credits: parseInt(e.target.value) || 3 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={templateConfig.duration}
                      onChange={(e) => setTemplateConfig(prev => ({ ...prev, duration: parseInt(e.target.value) || 3 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleTemplateGeneration}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      Generate Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CSV Upload */}
          {importMethod === 'csv' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">CSV Upload</h3>
                <button
                  onClick={downloadCsvTemplate}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      Click to upload CSV file
                    </span>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    CSV format: Code, Name, Credits, Type, Program, Semester, Duration, Prerequisites
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Course Preview */}
          {courses.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Course Preview ({courses.length} courses)
                </h3>
                <button
                  onClick={() => setCourses([])}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={course.code}
                            onChange={(e) => updateCourse(index, 'code', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) => updateCourse(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={course.program}
                            onChange={(e) => updateCourse(index, 'program', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {programs.map(program => (
                              <option key={program} value={program}>{program}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={course.semester}
                            onChange={(e) => updateCourse(index, 'semester', parseInt(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {semesters.map(semester => (
                              <option key={semester} value={semester}>{semester}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={course.type}
                            onChange={(e) => updateCourse(index, 'type', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {courseTypes.map(type => (
                              <option key={type} value={type} className="capitalize">
                                {type.replace('-', ' ')}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            max="6"
                            value={course.credits}
                            onChange={(e) => updateCourse(index, 'credits', parseInt(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            max="8"
                            value={course.duration}
                            onChange={(e) => updateCourse(index, 'duration', parseInt(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeCourse(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="mt-6">
              <div className={`p-4 rounded-lg ${results.errors.length === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center mb-2">
                  {results.errors.length === 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  )}
                  <span className={`font-medium ${results.errors.length === 0 ? 'text-green-800' : 'text-yellow-800'}`}>
                    Import Results
                  </span>
                </div>
                <p className={`text-sm ${results.errors.length === 0 ? 'text-green-700' : 'text-yellow-700'}`}>
                  Successfully imported {results.success} courses
                </p>
                {results.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-yellow-800">Errors:</p>
                    <ul className="text-sm text-yellow-700 list-disc list-inside">
                      {results.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkImport}
              disabled={courses.length === 0 || importing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Importing...
                </div>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {courses.length} Courses
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}