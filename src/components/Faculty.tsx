import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { Faculty } from '../types';
import { Users, Plus, Edit, Trash2, Search, Filter, Mail, Award, Clock, Upload } from 'lucide-react';
import BulkFacultyImport from './BulkFacultyImport';

export default function FacultyComponent() {
  const { state, dispatch } = useTimetable();
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const departments = [...new Set(state.faculty.map(f => f.department))];

  const filteredFaculty = state.faculty.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faculty.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || faculty.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleSubmit = (formData: Omit<Faculty, 'id'>) => {
    if (editingFaculty) {
      dispatch({
        type: 'UPDATE_FACULTY',
        payload: { ...formData, id: editingFaculty.id },
      });
    } else {
      dispatch({
        type: 'ADD_FACULTY',
        payload: { ...formData, id: `faculty-${Date.now()}` },
      });
    }
    setShowForm(false);
    setEditingFaculty(null);
  };

  const handleEdit = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setShowForm(true);
  };

  const handleDelete = (facultyId: string) => {
    if (confirm('Are you sure you want to delete this faculty member?')) {
      dispatch({ type: 'DELETE_FACULTY', payload: facultyId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
          <p className="text-gray-600 mt-1">Manage faculty members and their availability</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <Upload className="h-5 w-5 mr-2" />
            Bulk Import
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Faculty
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="h-4 w-4 mr-1" />
            {filteredFaculty.length} faculty members
          </div>
        </div>
      </div>

      {/* Faculty Form Modal */}
      {showBulkImport && (
        <BulkFacultyImport
          onClose={() => setShowBulkImport(false)}
        />
      )}

      {showForm && (
        <FacultyForm
          faculty={editingFaculty}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingFaculty(null);
          }}
        />
      )}

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map((faculty) => (
          <div key={faculty.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{faculty.name}</h3>
                    <p className="text-sm text-gray-600">{faculty.department}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(faculty)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faculty.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="truncate">{faculty.email}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="h-4 w-4 mr-2" />
                  <span className="truncate">{faculty.specialization.join(', ')}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{faculty.maxHoursPerWeek} hours/week</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Assigned Courses</span>
                  <span className="font-medium text-gray-900">{faculty.assignedCourses.length}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFaculty.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No faculty members found</h3>
          <p className="text-gray-600">
            {searchTerm || filterDepartment 
              ? 'Try adjusting your filters'
              : 'Start by adding your first faculty member'
            }
          </p>
        </div>
      )}
    </div>
  );
}

interface FacultyFormProps {
  faculty: Faculty | null;
  onSubmit: (faculty: Omit<Faculty, 'id'>) => void;
  onCancel: () => void;
}

function FacultyForm({ faculty, onSubmit, onCancel }: FacultyFormProps) {
  const [formData, setFormData] = useState<Omit<Faculty, 'id'>>({
    name: faculty?.name || '',
    email: faculty?.email || '',
    department: faculty?.department || '',
    specialization: faculty?.specialization || [],
    maxHoursPerWeek: faculty?.maxHoursPerWeek || 20,
    availability: faculty?.availability || {
      Monday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
      Tuesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
      Wednesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
      Thursday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
      Friday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
    },
    assignedCourses: faculty?.assignedCourses || [],
  });

  const [specializationInput, setSpecializationInput] = useState('');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addSpecialization = () => {
    if (specializationInput.trim() && !formData.specialization.includes(specializationInput.trim())) {
      setFormData({
        ...formData,
        specialization: [...formData.specialization, specializationInput.trim()]
      });
      setSpecializationInput('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setFormData({
      ...formData,
      specialization: formData.specialization.filter(s => s !== spec)
    });
  };

  const toggleAvailability = (day: string, timeSlot: string) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          [timeSlot]: !formData.availability[day]?.[timeSlot]
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {faculty ? 'Edit Faculty' : 'Add Faculty'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Dr. John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="john.smith@university.edu"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Hours Per Week *
              </label>
              <input
                type="number"
                required
                min="1"
                max="40"
                value={formData.maxHoursPerWeek}
                onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specializations
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={specializationInput}
                onChange={(e) => setSpecializationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add specialization"
              />
              <button
                type="button"
                onClick={addSpecialization}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specialization.map((spec, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialization(spec)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Availability Schedule
            </label>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Time</th>
                    {days.map(day => (
                      <th key={day} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        {day.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(timeSlot => (
                    <tr key={timeSlot} className="border-t">
                      <td className="px-4 py-2 text-sm text-gray-900">{timeSlot}</td>
                      {days.map(day => (
                        <td key={`${day}-${timeSlot}`} className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={formData.availability[day]?.[timeSlot] || false}
                            onChange={() => toggleAvailability(day, timeSlot)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors duration-200"
            >
              {faculty ? 'Update' : 'Add'} Faculty
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}