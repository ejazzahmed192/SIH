import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { Student } from '../types';
import { GraduationCap, Plus, Edit, Trash2, Search, Filter, Mail, BookOpen, Upload } from 'lucide-react';
import BulkStudentImport from './BulkStudentImport';

export default function StudentsComponent() {
  const { state, dispatch } = useTimetable();
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  const programs = ['FYUP', 'B.Ed', 'M.Ed', 'ITEP'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const filteredStudents = state.students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = !filterProgram || student.program === filterProgram;
    const matchesSemester = !filterSemester || student.semester === parseInt(filterSemester);
    return matchesSearch && matchesProgram && matchesSemester;
  });

  const handleSubmit = (formData: Omit<Student, 'id'>) => {
    if (editingStudent) {
      dispatch({
        type: 'UPDATE_STUDENT',
        payload: { ...formData, id: editingStudent.id },
      });
    } else {
      dispatch({
        type: 'ADD_STUDENT',
        payload: { ...formData, id: `student-${Date.now()}` },
      });
    }
    setShowForm(false);
    setEditingStudent(null);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDelete = (studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      dispatch({ type: 'DELETE_STUDENT', payload: studentId });
    }
  };

  const getProgramColor = (program: string) => {
    const colors = {
      'FYUP': 'bg-blue-100 text-blue-800',
      'B.Ed': 'bg-green-100 text-green-800',
      'M.Ed': 'bg-purple-100 text-purple-800',
      'ITEP': 'bg-orange-100 text-orange-800',
    };
    return colors[program as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-1">Manage student enrollments and course selections</p>
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
            Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
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
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Semesters</option>
            {semesters.map(semester => (
              <option key={semester} value={semester}>Semester {semester}</option>
            ))}
          </select>
          
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="h-4 w-4 mr-1" />
            {filteredStudents.length} students
          </div>
        </div>
      </div>

      {/* Student Form Modal */}
      {showForm && (
        <StudentForm
          student={editingStudent}
          courses={state.courses}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
        />
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkStudentImport
          onClose={() => setShowBulkImport(false)}
        />
      )}

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProgramColor(student.program)}`}>
                        {student.program}
                      </span>
                      <span className="text-sm text-gray-600">Sem {student.semester}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(student)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="truncate">{student.email}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>{student.selectedCourses.length} courses enrolled</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                
                {student.selectedCourses.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Enrolled Courses:</div>
                    <div className="flex flex-wrap gap-1">
                      {student.selectedCourses.slice(0, 3).map((courseId) => {
                        const course = state.courses.find(c => c.id === courseId);
                        return course ? (
                          <span
                            key={courseId}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                          >
                            {course.code}
                          </span>
                        ) : null;
                      })}
                      {student.selectedCourses.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                          +{student.selectedCourses.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">
            {searchTerm || filterProgram || filterSemester 
              ? 'Try adjusting your filters'
              : 'Start by adding your first student'
            }
          </p>
        </div>
      )}
    </div>
  );
}

interface StudentFormProps {
  student: Student | null;
  courses: any[];
  onSubmit: (student: Omit<Student, 'id'>) => void;
  onCancel: () => void;
}

function StudentForm({ student, courses, onSubmit, onCancel }: StudentFormProps) {
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: student?.name || '',
    email: student?.email || '',
    program: student?.program || 'FYUP',
    semester: student?.semester || 1,
    selectedCourses: student?.selectedCourses || [],
  });

  const programs = ['FYUP', 'B.Ed', 'M.Ed', 'ITEP'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // Filter courses based on selected program and semester
  const availableCourses = courses.filter(
    course => course.program === formData.program && course.semester === formData.semester
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleCourse = (courseId: string) => {
    setFormData({
      ...formData,
      selectedCourses: formData.selectedCourses.includes(courseId)
        ? formData.selectedCourses.filter(id => id !== courseId)
        : [...formData.selectedCourses, courseId]
    });
  };

  const handleProgramOrSemesterChange = (field: 'program' | 'semester', value: any) => {
    setFormData({
      ...formData,
      [field]: value,
      selectedCourses: [], // Reset selected courses when program/semester changes
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {student ? 'Edit Student' : 'Add Student'}
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
                placeholder="John Doe"
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
                placeholder="john.doe@student.edu"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program *
              </label>
              <select
                required
                value={formData.program}
                onChange={(e) => handleProgramOrSemesterChange('program', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {programs.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester *
              </label>
              <select
                required
                value={formData.semester}
                onChange={(e) => handleProgramOrSemesterChange('semester', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {semesters.map(semester => (
                  <option key={semester} value={semester}>Semester {semester}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Course Selection
            </label>
            {availableCourses.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No courses available for {formData.program} Semester {formData.semester}
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                {availableCourses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedCourses.includes(course.id)}
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
            <p className="text-sm text-gray-500 mt-2">
              Selected: {formData.selectedCourses.length} courses
            </p>
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
              {student ? 'Update' : 'Add'} Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}