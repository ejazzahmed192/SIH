import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { Room } from '../types';
import { Upload, Download, MapPin, Plus, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface BulkRoomImportProps {
  onClose: () => void;
}

interface RoomTemplate {
  name: string;
  type: 'classroom' | 'lab' | 'seminar' | 'auditorium';
  capacity: number;
  equipment: string[];
}

export default function BulkRoomImport({ onClose }: BulkRoomImportProps) {
  const { state, dispatch } = useTimetable();
  const [importMethod, setImportMethod] = useState<'csv' | 'template'>('template');
  const [rooms, setRooms] = useState<RoomTemplate[]>([]);
  const [csvData, setCsvData] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);

  // Template configuration
  const [templateConfig, setTemplateConfig] = useState({
    type: 'classroom' as const,
    count: 10,
    capacity: 30,
    equipment: ['Projector', 'Whiteboard']
  });

  const roomTypes = ['classroom', 'lab', 'seminar', 'auditorium'];
  const commonEquipment = [
    'Projector', 'Whiteboard', 'Audio System', 'Computers', 'Smart Board',
    'Air Conditioning', 'WiFi', 'Microphone', 'Screen', 'Speakers'
  ];

  const handleTemplateGeneration = () => {
    const newRooms: RoomTemplate[] = [];
    
    for (let i = 1; i <= templateConfig.count; i++) {
      const roomNumber = i.toString().padStart(3, '0');
      newRooms.push({
        name: `${templateConfig.type.charAt(0).toUpperCase() + templateConfig.type.slice(1)} ${roomNumber}`,
        type: templateConfig.type,
        capacity: templateConfig.capacity,
        equipment: [...templateConfig.equipment]
      });
    }
    
    setRooms(newRooms);
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
    
    const parsedRooms: RoomTemplate[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length >= 4) {
        const equipment = values[3] ? values[3].split(';').map(e => e.trim()) : [];
        
        parsedRooms.push({
          name: values[0] || `Room ${i}`,
          type: (values[1] as any) || 'classroom',
          capacity: parseInt(values[2]) || 30,
          equipment: equipment
        });
      }
    }
    
    setRooms(parsedRooms);
  };

  const handleBulkImport = async () => {
    setImporting(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      for (const roomData of rooms) {
        try {
          // Validate room data
          if (!roomData.name || !roomData.type) {
            errors.push(`Invalid data for room: ${roomData.name || 'Unknown'}`);
            continue;
          }

          // Check if room already exists
          const existingRoom = state.rooms.find(r => r.name === roomData.name);
          if (existingRoom) {
            errors.push(`Room with name ${roomData.name} already exists`);
            continue;
          }

          const newRoom: Room = {
            id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: roomData.name,
            type: roomData.type,
            capacity: roomData.capacity,
            equipment: roomData.equipment,
            availability: {
              Monday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
              Tuesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
              Wednesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
              Thursday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
              Friday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
            }
          };

          dispatch({ type: 'ADD_ROOM', payload: newRoom });
          successCount++;
        } catch (error) {
          errors.push(`Error adding room ${roomData.name}: ${error}`);
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
    const headers = ['Name', 'Type', 'Capacity', 'Equipment (semicolon separated)'];
    const sampleData = [
      'Classroom 101,classroom,50,Projector;Whiteboard;Audio System',
      'CS Lab 1,lab,30,Computers;Projector;Whiteboard'
    ];
    
    const csvContent = [headers.join(','), ...sampleData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'room_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const updateRoom = (index: number, field: keyof RoomTemplate, value: any) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = { ...updatedRooms[index], [field]: value };
    setRooms(updatedRooms);
  };

  const removeRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const toggleEquipment = (equipment: string) => {
    setTemplateConfig(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Bulk Room Import</h2>
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
                  <div className="text-sm text-gray-500">Generate rooms with predefined configurations</div>
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
                  <div className="text-sm text-gray-500">Upload room data from CSV file</div>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                    <select
                      value={templateConfig.type}
                      onChange={(e) => setTemplateConfig(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {roomTypes.map(type => (
                        <option key={type} value={type} className="capitalize">{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Count</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={templateConfig.count}
                      onChange={(e) => setTemplateConfig(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={templateConfig.capacity}
                      onChange={(e) => setTemplateConfig(prev => ({ ...prev, capacity: parseInt(e.target.value) || 30 }))}
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

                {/* Equipment Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment ({templateConfig.equipment.length} selected)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {commonEquipment.map((equipment) => (
                      <label key={equipment} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={templateConfig.equipment.includes(equipment)}
                          onChange={() => toggleEquipment(equipment)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-sm text-gray-700">{equipment}</span>
                      </label>
                    ))}
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
                    CSV format: Name, Type, Capacity, Equipment
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Room Preview */}
          {rooms.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Room Preview ({rooms.length} rooms)
                </h3>
                <button
                  onClick={() => setRooms([])}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rooms.map((room, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={room.name}
                            onChange={(e) => updateRoom(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={room.type}
                            onChange={(e) => updateRoom(index, 'type', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {roomTypes.map(type => (
                              <option key={type} value={type} className="capitalize">{type}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="10"
                            max="500"
                            value={room.capacity}
                            onChange={(e) => updateRoom(index, 'capacity', parseInt(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">
                            {room.equipment.join(', ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeRoom(index)}
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
                  Successfully imported {results.success} rooms
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
              disabled={rooms.length === 0 || importing}
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
                  Import {rooms.length} Rooms
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}