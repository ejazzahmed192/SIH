import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { Student, Course } from '../types';
import { Upload, Download, Users, Plus, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface BulkStudentImportProps {
  onClose: () => void;
}

interface StudentTemplate {
  name: string;
  email: string;
  program: 'FYUP' | 'B.Ed' | 'M.Ed' | 'ITEP';
  semester: number;
  selectedCourses: string[];
}

export default function BulkStudentImport({ onClose }: BulkStudentImportProps) {
  const { state, dispatch } = useTimetable();
  const [importMethod, setImportMethod] = useState<'csv' | 'template'>('template');
  const [students, setStudents] = useState<StudentTemplate[]>([]);
  const [csvData, setCsvData] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);

  // Template configuration
  const [templateConfig, setTemplateConfig] = useState({
    program: 'FYUP' as const,
    semester: 1,
    selectedCourses: [] as string[],
    count: 10
  });

  const programs = ['FYUP', 'B.Ed', 'M.Ed', 'ITEP'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // Get available courses for selected program and semester
  const availableCourses = state.courses.filter(
    course => course.program === templateConfig.program && course.semester === templateConfig.semester
  );

  const handleTemplateGeneration = () => {
    const newStudents: StudentTemplate[] = [];
    
    for (let i = 1; i <= templateConfig.count; i++) {
      newStudents.push({
        name: `Student ${i.toString().padStart(3, '0')}`,
        email: `student${i.toString().padStart(3, '0')}@${templateConfig.program.toLowerCase()}.edu`,
        program: templateConfig.program,
        semester: templateConfig.semester,
        selectedCourses: [...templateConfig.selectedCourses]
      });
    }
    
    setStudents(newStudents);
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
    
    const parsedStudents: StudentTemplate[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length >= 4) {
        const courseIds = values.slice(4).filter(id => id && state.courses.some(c => c.id === id));
        
        parsedStudents.push({
          name: values[0] || `Student ${i}`,
          email: values[1] || `student${i}@university.edu`,
          program: (values[2] as any) || 'FYUP',
          semester: parseInt(values[3]) || 1,
          selectedCourses: courseIds
        });
      }
    }
    
    setStudents(parsedStudents);
  };

  const handleBulkImport = async () => {
    setImporting(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      for (const studentData of students) {
        try {
          // Validate student data
          if (!studentData.name || !studentData.email) {
            errors.push(`Invalid data for student: ${studentData.name || 'Unknown'}`);
            continue;
          }

          // Check if email already exists
          const existingStudent = state.students.find(s => s.email === studentData.email);
          if (existingStudent) {
            errors.push(`Student with email ${studentData.email} already exists`);
            continue;
          }

          // Validate courses
          const validCourses = studentData.selectedCourses.filter(courseId =>
            state.courses.some(c => c.id === courseId)
          );

          const newStudent: Student = {
            id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: studentData.name,
            email: studentData.email,
            program: studentData.program,
            semester: studentData.semester,
            selectedCourses: validCourses
          };

          dispatch({ type: 'ADD_STUDENT', payload: newStudent });
          successCount++;
        } catch (error) {
          errors.push(`Error adding student ${studentData.name}: ${error}`);
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
    const headers = ['Name', 'Email', 'Program', 'Semester', 'Course IDs (comma separated)'];
    const sampleData = [
      'John Doe,john.doe@university.edu,FYUP,1,course-1,course-2',
      'Jane Smith,jane.smith@university.edu,B.Ed,2,course-3,course-4'
    ];
    
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const updateStudent = (index: number, field: keyof StudentTemplate, value: any) => {
    const updatedStudents = [...students];
    updatedStudents[index] = { ...updatedStudents[index], [field]: value };
    setStudents(updatedStudents);
  };

  const removeStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const toggleCourse = (courseId: string) => {
    setTemplateConfig(prev => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(courseId)
        ? prev.selectedCourses.filter(id => id !== courseId)
        : [...prev.selectedCourses, courseId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Bulk Student Import</h2>
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
                  <div className="text-sm text-gray-500">Generate students with predefined courses</div>
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
                  <div className="text-sm text-gray-500">Upload student data from CSV file</div>
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
                      onChange={(e) => setTemplateConfig(prev => ({ 
                        ...prev, 
                        program: e.target.value as any,
                        selectedCourses: [] // Reset courses when program changes
                      }))}
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
                      onChange={(e) => setTemplateConfig(prev => ({ 
                        ...prev, 
                        semester: parseInt(e.target.value),
                        selectedCourses: [] // Reset courses when semester changes
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {semesters.map(semester => (
                        <option key={semester} value={semester}>Semester {semester}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Count</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={templateConfig.count}
                      onChange={(e) => setTemplateConfig(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
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

                {/* Course Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Courses ({templateConfig.selectedCourses.length} selected)
                  </label>
                  {availableCourses.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No courses available for {templateConfig.program} Semester {templateConfig.semester}
                    </p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                      {availableCourses.map((course) => (
                        <label
                          key={course.id}
                          className="flex items-center p-2 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={templateConfig.selectedCourses.includes(course.id)}
                            onChange={() => toggleCourse(course.id)}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-medium text-gray-900">{course.code}</span>
                                <span className="ml-2 text-sm text-gray-600">{course.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {course.credits} credits
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">
                                  {course.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
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
                    CSV format: Name, Email, Program, Semester, Course IDs...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Student Preview */}
          {students.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Student Preview ({students.length} students)
                </h3>
                <button
                  onClick={() => setStudents([])}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courses</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={student.name}
                            onChange={(e) => updateStudent(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="email"
                            value={student.email}
                            onChange={(e) => updateStudent(index, 'email', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={student.program}
                            onChange={(e) => updateStudent(index, 'program', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {programs.map(program => (
                              <option key={program} value={program}>{program}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={student.semester}
                            onChange={(e) => updateStudent(index, 'semester', parseInt(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {semesters.map(semester => (
                              <option key={semester} value={semester}>{semester}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {student.selectedCourses.length} courses
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeStudent(index)}
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
                  Successfully imported {results.success} students
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
              disabled={students.length === 0 || importing}
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
                  Import {students.length} Students
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}