import React from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import {
  Calendar,
  Users,
  BookOpen,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function Dashboard() {
  const { state } = useTimetable();

  const stats = [
    {
      name: 'Total Courses',
      value: state.courses.length,
      icon: BookOpen,
      color: 'bg-blue-500',
    },
    {
      name: 'Faculty Members',
      value: state.faculty.length,
      icon: Users,
      color: 'bg-teal-500',
    },
    {
      name: 'Rooms Available',
      value: state.rooms.length,
      icon: MapPin,
      color: 'bg-orange-500',
    },
    {
      name: 'Active Timetables',
      value: state.timetables.length,
      icon: Calendar,
      color: 'bg-green-500',
    },
  ];

  const recentTimetables = state.timetables
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 5);

  const conflicts = state.conflicts.length;
  const utilizationRate = state.rooms.length > 0 ? 
    Math.round((state.timetables.reduce((sum, t) => sum + t.timeSlots.length, 0) / (state.rooms.length * 48)) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Academic Timetable Management System</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conflicts</span>
              <span className={`text-sm font-medium ${conflicts === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {conflicts}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Room Utilization</span>
              <span className="text-sm font-medium text-blue-600">{utilizationRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Schedule Efficiency</span>
              <span className="text-sm font-medium text-green-600">92%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">NEP 2020 Compliance</h3>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Multidisciplinary Approach</span>
              <span className="text-sm font-medium text-green-600">✓ Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Choice-Based Credits</span>
              <span className="text-sm font-medium text-green-600">✓ Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Flexible Curriculum</span>
              <span className="text-sm font-medium text-green-600">✓ Implemented</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Program Distribution</h3>
            <Clock className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">FYUP</span>
              <span className="text-sm font-medium text-blue-600">
                {state.courses.filter(c => c.program === 'FYUP').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">B.Ed</span>
              <span className="text-sm font-medium text-blue-600">
                {state.courses.filter(c => c.program === 'B.Ed').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">M.Ed</span>
              <span className="text-sm font-medium text-blue-600">
                {state.courses.filter(c => c.program === 'M.Ed').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ITEP</span>
              <span className="text-sm font-medium text-blue-600">
                {state.courses.filter(c => c.program === 'ITEP').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Timetables */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Timetables</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentTimetables.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No timetables created yet.</p>
              <p className="text-sm text-gray-400 mt-1">
                Start by creating your first timetable using the AI Generator.
              </p>
            </div>
          ) : (
            recentTimetables.map((timetable) => (
              <div key={timetable.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
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
                  <div className="flex items-center space-x-2">
                    {timetable.conflicts.length > 0 && (
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm text-red-600">
                          {timetable.conflicts.length} conflicts
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-400">
                      {new Date(timetable.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}