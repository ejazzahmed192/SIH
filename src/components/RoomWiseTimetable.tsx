import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { MapPin, Calendar, Clock, Users, BookOpen, Filter, Search } from 'lucide-react';

export default function RoomWiseTimetable() {
  const { state } = useTimetable();
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  const filteredRooms = state.rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoomSchedule = (roomId: string) => {
    const schedule = new Map<string, Map<string, any>>();
    
    // Initialize schedule structure
    days.forEach(day => {
      schedule.set(day, new Map());
      timeSlots.forEach(timeSlot => {
        schedule.get(day)!.set(timeSlot, null);
      });
    });

    // Fill schedule with actual classes
    state.timetables.forEach(timetable => {
      timetable.timeSlots
        .filter(slot => slot.roomId === roomId)
        .forEach(slot => {
          const timeSlotKey = `${slot.startTime}-${slot.endTime}`;
          const course = state.courses.find(c => c.id === slot.courseId);
          const faculty = state.faculty.find(f => f.id === slot.facultyId);
          
          schedule.get(slot.day)?.set(timeSlotKey, {
            course,
            faculty,
            timetable,
            slot
          });
        });
    });

    return schedule;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'theory': 'bg-blue-100 border-blue-300 text-blue-800',
      'practical': 'bg-green-100 border-green-300 text-green-800',
      'lab': 'bg-orange-100 border-orange-300 text-orange-800',
      'project': 'bg-purple-100 border-purple-300 text-purple-800',
      'fieldwork': 'bg-teal-100 border-teal-300 text-teal-800',
      'internship': 'bg-indigo-100 border-indigo-300 text-indigo-800',
      'teaching-practice': 'bg-pink-100 border-pink-300 text-pink-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 border-gray-300 text-gray-800';
  };

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'lab': return '🔬';
      case 'auditorium': return '🎭';
      case 'seminar': return '💼';
      default: return '📚';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MapPin className="h-8 w-8 mr-3 text-blue-600" />
            Room-wise Timetables
          </h1>
          <p className="text-gray-600 mt-1">View schedules organized by rooms and facilities</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Rooms</option>
            {filteredRooms.map(room => (
              <option key={room.id} value={room.id}>
                {getRoomTypeIcon(room.type)} {room.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Days</option>
            {days.map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Timetables */}
      <div className="space-y-8">
        {filteredRooms
          .filter(room => !selectedRoom || room.id === selectedRoom)
          .map(room => {
            const schedule = getRoomSchedule(room.id);
            const displayDays = selectedDay ? [selectedDay] : days;
            
            return (
              <div key={room.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Room Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">{getRoomTypeIcon(room.type)}</div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{room.name}</h2>
                        <div className="flex items-center text-blue-100 text-sm">
                          <span className="capitalize mr-4">{room.type}</span>
                          <Users className="h-4 w-4 mr-1" />
                          <span>Capacity: {room.capacity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-blue-100">
                      <div className="text-sm">Equipment</div>
                      <div className="text-xs">
                        {room.equipment.slice(0, 3).join(', ')}
                        {room.equipment.length > 3 && ` +${room.equipment.length - 3} more`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule Grid */}
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                          Time
                        </th>
                        {displayDays.map(day => (
                          <th
                            key={day}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {timeSlots.map(timeSlot => (
                        <tr key={timeSlot} className="hover:bg-gray-50">
                          <td className="sticky left-0 bg-white px-4 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-400" />
                              {timeSlot}
                            </div>
                          </td>
                          {displayDays.map(day => {
                            const classInfo = schedule.get(day)?.get(timeSlot);
                            
                            return (
                              <td
                                key={`${day}-${timeSlot}`}
                                className="px-4 py-4 align-top border-r border-gray-200"
                                style={{ minHeight: '100px' }}
                              >
                                {classInfo ? (
                                  <div className={`p-3 rounded border-2 ${getTypeColor(classInfo.course?.type || 'theory')}`}>
                                    <div className="font-semibold text-sm mb-1">
                                      {classInfo.course?.code}
                                    </div>
                                    <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                                      {classInfo.course?.name}
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex items-center text-xs">
                                        <Users className="h-3 w-3 mr-1" />
                                        <span className="truncate">{classInfo.faculty?.name}</span>
                                      </div>
                                      <div className="flex items-center text-xs">
                                        <BookOpen className="h-3 w-3 mr-1" />
                                        <span className="truncate">{classInfo.timetable?.program} Sem {classInfo.timetable?.semester}</span>
                                      </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                      <span className="text-xs font-medium px-2 py-1 rounded bg-white bg-opacity-50 capitalize">
                                        {classInfo.course?.type?.replace('-', ' ')}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {classInfo.course?.credits} credits
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-20 flex items-center justify-center text-gray-400 text-sm">
                                    Free
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Room Utilization Stats */}
                <div className="bg-gray-50 px-6 py-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600">
                        Utilization: {Math.round((schedule.size * timeSlots.length - 
                          Array.from(schedule.values()).reduce((count, daySchedule) => 
                            count + Array.from(daySchedule.values()).filter(slot => !slot).length, 0)
                        ) / (schedule.size * timeSlots.length) * 100)}%
                      </span>
                      <span className="text-gray-600">
                        Classes: {Array.from(schedule.values()).reduce((count, daySchedule) => 
                          count + Array.from(daySchedule.values()).filter(slot => slot).length, 0)}
                      </span>
                    </div>
                    <div className="text-gray-500">
                      Room ID: {room.id}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'Add rooms to view their schedules'}
          </p>
        </div>
      )}
    </div>
  );
}