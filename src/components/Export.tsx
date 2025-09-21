import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { ExportUtils } from '../utils/exportUtils';
import { FileDown, FileText, File, Calendar, CheckCircle } from 'lucide-react';

export default function Export() {
  const { state } = useTimetable();
  const [selectedTimetables, setSelectedTimetables] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (selectedTimetables.length === 0) {
      alert('Please select at least one timetable to export');
      return;
    }

    setExporting(true);
    
    try {
      for (const timetableId of selectedTimetables) {
        const timetable = state.timetables.find(t => t.id === timetableId);
        if (!timetable) continue;

        if (exportFormat === 'pdf') {
          ExportUtils.exportToPDF(timetable, state.courses, state.faculty, state.rooms);
        } else {
          ExportUtils.exportToExcel(timetable, state.courses, state.faculty, state.rooms);
        }
        
        // Small delay between exports
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleToggleTimetable = (timetableId: string) => {
    setSelectedTimetables(prev =>
      prev.includes(timetableId)
        ? prev.filter(id => id !== timetableId)
        : [...prev, timetableId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTimetables(
      selectedTimetables.length === state.timetables.length
        ? []
        : state.timetables.map(t => t.id)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileDown className="h-8 w-8 mr-3 text-blue-600" />
            Export Timetables
          </h1>
          <p className="text-gray-600 mt-1">Export timetables to PDF or Excel format</p>
        </div>
      </div>

      {state.timetables.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No timetables available</h3>
          <p className="text-gray-600">
            Create timetables first using the AI Generator before exporting.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Export Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="pdf"
                        checked={exportFormat === 'pdf'}
                        onChange={(e) => setExportFormat(e.target.value as 'pdf')}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <FileText className="h-4 w-4 mr-2 text-red-500" />
                      <span className="text-sm text-gray-700">PDF Format</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="excel"
                        checked={exportFormat === 'excel'}
                        onChange={(e) => setExportFormat(e.target.value as 'excel')}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <File className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm text-gray-700">Excel Format</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Selected Timetables
                    </span>
                    <span className="text-sm text-gray-500">
                      {selectedTimetables.length} of {state.timetables.length}
                    </span>
                  </div>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {selectedTimetables.length === state.timetables.length 
                      ? 'Deselect All' 
                      : 'Select All'
                    }
                  </button>
                </div>

                <button
                  onClick={handleExport}
                  disabled={selectedTimetables.length === 0 || exporting}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {exporting ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Exporting...
                    </div>
                  ) : (
                    <>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export Selected
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Timetables List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Available Timetables</h2>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {state.timetables.map((timetable) => (
                  <div key={timetable.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTimetables.includes(timetable.id)}
                          onChange={() => handleToggleTimetable(timetable.id)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {timetable.name}
                          </p>
                          <div className="flex items-center mt-1 space-x-4">
                            <p className="text-sm text-gray-500">{timetable.program}</p>
                            <p className="text-sm text-gray-500">Semester {timetable.semester}</p>
                            <p className="text-sm text-gray-500">
                              {timetable.timeSlots.length} sessions
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {timetable.conflicts.length === 0 && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">No conflicts</span>
                          </div>
                        )}
                        <p className="text-sm text-gray-400">
                          {new Date(timetable.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Export Information</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>PDF Format:</strong> Professional printable timetables with formatted tables and course details.</p>
          <p><strong>Excel Format:</strong> Editable spreadsheets with separate sheets for timetables, courses, faculty, and rooms.</p>
          <p><strong>Academic Integration:</strong> Compatible with most Academic Management Systems for easy import.</p>
        </div>
      </div>
    </div>
  );
}