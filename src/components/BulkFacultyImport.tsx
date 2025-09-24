import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { Faculty } from '../types';
import { Upload, Download, Users, Plus, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface BulkFacultyImportProps {
  onClose: () => void;
}

interface FacultyTemplate {
  name: string;
  email: string;
  department: string;
  specialization: string[];
  maxHoursPerWeek: number;
}

export default function BulkFacultyImport({ onClose }: BulkFacultyImportProps) {
  const { state, dispatch } = useTimetable();
  const [importMethod, setImportMethod] = useState<'csv' | 'template'>('template');
  const [faculty, setFaculty] = useState<FacultyTemplate[]>([]);
  const [csvData, setCsvData] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);

  // Template configuration
  const [templateConfig, setTemplateConfig] = useState({
    department: 'Computer Science',
    count: 5,
    maxHoursPerWeek: 20
  });

  const departments = [
    'Computer Science', 'Education', 'Mathematics', 'Physics', 'Chemistry',
    'Biology', 'English', 'History', 'Psychology', 'Management'
  ];

  const handleTemplateGeneration = () => {
    const newFaculty: FacultyTemplate[] = [];
    
    for (let i = 1; i <= templateConfig.count; i++) {
      newFaculty.push({
        name: `Dr. Faculty ${i.toString().padStart(2, '0')}`,
        email: `faculty${i.toString().padStart(2, '0')}@${templateConfig.department.toLowerCase().replace(' ', '')}.edu`,
        department: templateConfig.department,
        specialization: [`${templateConfig.department} Specialization`],
        maxHoursPerWeek: templateConfig.maxHoursPerWeek
      });
    }
    
    setFaculty(newFaculty);
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
    
    const parsedFaculty: FacultyTemplate[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length >= 5) {
        const specializations = values[3] ? values[3].split(';').map(s => s.trim()) : [];
        
        parsedFaculty.push({
          name: values[0] || `Faculty ${i}`,
          email: values[1] || `faculty${i}@university.edu`,
          department: values[2] || 'General',
          specialization: specializations,
          maxHoursPerWeek: parseInt(values[4]) || 20
        });
      }
    }
    
    setFaculty(parsedFaculty);
  };

  const handleBulkImport = async () => {
    setImporting(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      for (const facultyData of faculty) {
        try {
          // Validate faculty data
          if (!facultyData.name || !facultyData.email) {
            errors.push(`Invalid data for faculty: ${facultyData.name || 'Unknown'}`);
            continue;
          }

          // Check if email already exists
          const existingFaculty = state.faculty.find(f => f.email === facultyData.email);
          if (existingFaculty) {
            errors.push(`Faculty with email ${facultyData.email} already exists`);
            continue;
          }

          const newFaculty: Faculty = {
            id: `faculty-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: facultyData.name,
            email: facultyData.email,
            department: facultyData.department,
            specialization: facultyData.specialization,
            maxHoursPerWeek: facultyData.maxHoursPerWeek,
            availability: {
              Monday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
              Tuesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
              Wednesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
              Thursday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
              Friday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
            },
            assignedCourses: []
          };

          dispatch({ type: 'ADD_FACULTY', payload: newFaculty });
          successCount++;
        } catch (error) {
          errors.push(`Error adding faculty ${facultyData.name}: ${error}`);
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
    const headers = ['Name', 'Email', 'Department', 'Specializations (semicolon separated)', 'Max Hours Per Week'];
    const sampleData = [
      'Dr. John Smith,john.smith@cs.edu,Computer Science,Programming;Algorithms,20',
      'Prof. Jane Doe,jane.doe@edu.edu,Education,Teaching Methods;Curriculum Design,18'
    ];
    
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faculty_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const updateFaculty = (index: number, field: keyof FacultyTemplate, value: any) => {
    const updatedFaculty = [...faculty];
    updatedFaculty[index] = { ...updatedFaculty[index], [field]: value };
    setFaculty(updatedFaculty);
  };

  const removeFaculty = (index: number) => {
    setFaculty(faculty.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Bulk Faculty Import</h2>
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
                  <div className="text-sm text-gray-500">Generate faculty with predefined departments</div>
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
                  <div className="text-sm text-gray-500">Upload faculty data from CSV file</div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={templateConfig.department}
                      onChange={(e) => setTemplateConfig(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Count</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={templateConfig.count}
                      onChange={(e) => setTemplateConfig(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Hours/Week</label>
                    <input
                      type="number"
                      min="10"
                      max="40"
                      value={templateConfig.maxHoursPerWeek}
                      onChange={(e) => setTemplateConfig(prev => ({ ...prev, maxHoursPerWeek: parseInt(e.target.value) || 20 }))}
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
                    CSV format: Name, Email, Department, Specializations, Max Hours
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Faculty Preview */}
          {faculty.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Faculty Preview ({faculty.length} faculty members)
                </h3>
                <button
                  onClick={() => setFaculty([])}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Hours</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {faculty.map((facultyMember, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={facultyMember.name}
                            onChange={(e) => updateFaculty(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="email"
                            value={facultyMember.email}
                            onChange={(e) => updateFaculty(index, 'email', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={facultyMember.department}
                            onChange={(e) => updateFaculty(index, 'department', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {departments.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {facultyMember.specialization.join(', ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="10"
                            max="40"
                            value={facultyMember.maxHoursPerWeek}
                            onChange={(e) => updateFaculty(index, 'maxHoursPerWeek', parseInt(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeFaculty(index)}
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
                  Successfully imported {results.success} faculty members
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
              disabled={faculty.length === 0 || importing}
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
                  Import {faculty.length} Faculty
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}