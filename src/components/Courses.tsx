import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { Course } from '../types';
import { BookOpen, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

export default function Courses() {
  const { state, dispatch } = useTimetable();
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterType, setFilterType] = useState('');

  const programs = ['FYUP', 'B.Ed', 'M.Ed', 'ITEP'];
  const courseTypes = ['theory', 'practical', 'lab', 'project', 'fieldwork', 'internship', 'teaching-practice'];

  const filteredCourses = state.courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = !filterProgram || course.program === filterProgram;
    const matchesType = !filterType || course.type === filterType;
    return matchesSearch && matchesProgram && matchesType;
  });

  const handleSubmit = (formData: Omit<Course, 'id'>) => {
    if (editingCourse) {
      dispatch({
        type: 'UPDATE_COURSE',
        payload: { ...formData, id: editingCourse.id },
      });
    } else {
      dispatch({
        type: 'ADD_COURSE',
        payload: { ...formData, id: `course-${Date.now()}` },
      });
    }
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDelete = (courseId: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      dispatch({ type: 'DELETE_COURSE', payload: courseId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">Manage courses according to NEP 2020 guidelines</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Course
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterProgram}
            onChange={(e) => setFilterProgram(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Programs</option>
            {programs.map(program => (
              <option key={program} value={program}>{program}</option>
            ))}
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {courseTypes.map(type => (
              <option key={type} value={type} className="capitalize">
                {type.replace('-', ' ')}
              </option>
            ))}
          </select>
          
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="h-4 w-4 mr-1" />
            {filteredCourses.length} courses
          </div>
        </div>
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <CourseForm
          course={editingCourse}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingCourse(null);
          }}
        />
      )}

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">
              {searchTerm || filterProgram || filterType 
                ? 'Try adjusting your filters'
                : 'Start by adding your first course'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{course.code}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{course.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {course.program}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">Sem {course.semester}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                        {course.type.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.credits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.duration}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface CourseFormProps {
  course: Course | null;
  onSubmit: (course: Omit<Course, 'id'>) => void;
  onCancel: () => void;
}

function CourseForm({ course, onSubmit, onCancel }: CourseFormProps) {
  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    code: course?.code || '',
    name: course?.name || '',
    credits: course?.credits || 1,
    type: course?.type || 'theory',
    program: course?.program || 'FYUP',
    semester: course?.semester || 1,
    duration: course?.duration || 1,
    prerequisites: course?.prerequisites || [],
  });

  const programs = ['FYUP', 'B.Ed', 'M.Ed', 'ITEP'];
  const courseTypes = ['theory', 'practical', 'lab', 'project', 'fieldwork', 'internship', 'teaching-practice'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {course ? 'Edit Course' : 'Add Course'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., CS101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program *
              </label>
              <select
                required
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {programs.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Introduction to Computer Science"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credits *
              </label>
              <input
                type="number"
                required
                min="1"
                max="6"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <select
                required
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {semesters.map(semester => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (hours) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="8"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
              {course ? 'Update' : 'Add'} Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}