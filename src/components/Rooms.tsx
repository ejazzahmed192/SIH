import React, { useState } from 'react';
import { useTimetable } from '../contexts/TimetableContext';
import { Room } from '../types';
import { MapPin, Plus, Edit, Trash2, Search, Filter, Users, Monitor, Upload } from 'lucide-react';
import BulkRoomImport from './BulkRoomImport';

export default function RoomsComponent() {
  const { state, dispatch } = useTimetable();
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  const roomTypes = ['classroom', 'lab', 'seminar', 'auditorium'];

  const filteredRooms = state.rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || room.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (formData: Omit<Room, 'id'>) => {
    if (editingRoom) {
      dispatch({
        type: 'UPDATE_ROOM',
        payload: { ...formData, id: editingRoom.id },
      });
    } else {
      dispatch({
        type: 'ADD_ROOM',
        payload: { ...formData, id: `room-${Date.now()}` },
      });
    }
    setShowForm(false);
    setEditingRoom(null);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleDelete = (roomId: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      dispatch({ type: 'DELETE_ROOM', payload: roomId });
    }
  };

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'lab': return <Monitor className="h-5 w-5" />;
      case 'auditorium': return <Users className="h-5 w-5" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };

  const getRoomTypeColor = (type: string) => {
    const colors = {
      'classroom': 'bg-blue-100 text-blue-800',
      'lab': 'bg-orange-100 text-orange-800',
      'seminar': 'bg-green-100 text-green-800',
      'auditorium': 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-1">Manage rooms, labs, and facilities</p>
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
            Add Room
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
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            {roomTypes.map(type => (
              <option key={type} value={type} className="capitalize">{type}</option>
            ))}
          </select>
          
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="h-4 w-4 mr-1" />
            {filteredRooms.length} rooms
          </div>
        </div>
      </div>

      {/* Room Form Modal */}
      {showBulkImport && (
        <BulkRoomImport
          onClose={() => setShowBulkImport(false)}
        />
      )}

      {showForm && (
        <RoomForm
          room={editingRoom}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRoom(null);
          }}
        />
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRoomTypeColor(room.type)}`}>
                    {getRoomTypeIcon(room.type)}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoomTypeColor(room.type)}`}>
                      {room.type}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(room)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Capacity</span>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="font-medium text-gray-900">{room.capacity}</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600 block mb-2">Equipment</span>
                  <div className="flex flex-wrap gap-1">
                    {room.equipment.slice(0, 3).map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                      >
                        {item}
                      </span>
                    ))}
                    {room.equipment.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        +{room.equipment.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Availability</span>
                  <span className="text-green-600 font-medium">Available</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType 
              ? 'Try adjusting your filters'
              : 'Start by adding your first room'
            }
          </p>
        </div>
      )}
    </div>
  );
}

interface RoomFormProps {
  room: Room | null;
  onSubmit: (room: Omit<Room, 'id'>) => void;
  onCancel: () => void;
}

function RoomForm({ room, onSubmit, onCancel }: RoomFormProps) {
  const [formData, setFormData] = useState<Omit<Room, 'id'>>({
    name: room?.name || '',
    type: room?.type || 'classroom',
    capacity: room?.capacity || 30,
    equipment: room?.equipment || [],
    availability: room?.availability || {
      Monday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
      Tuesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
      Wednesday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
      Thursday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
      Friday: { '09:00-10:00': true, '10:00-11:00': true, '11:00-12:00': true, '14:00-15:00': true, '15:00-16:00': true },
    },
  });

  const [equipmentInput, setEquipmentInput] = useState('');
  const roomTypes = ['classroom', 'lab', 'seminar', 'auditorium'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addEquipment = () => {
    if (equipmentInput.trim() && !formData.equipment.includes(equipmentInput.trim())) {
      setFormData({
        ...formData,
        equipment: [...formData.equipment, equipmentInput.trim()]
      });
      setEquipmentInput('');
    }
  };

  const removeEquipment = (equipment: string) => {
    setFormData({
      ...formData,
      equipment: formData.equipment.filter(e => e !== equipment)
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
          {room ? 'Edit Room' : 'Add Room'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Room 101"
              />
            </div>

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
                {roomTypes.map(type => (
                  <option key={type} value={type} className="capitalize">{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity *
              </label>
              <input
                type="number"
                required
                min="1"
                max="500"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add equipment"
              />
              <button
                type="button"
                onClick={addEquipment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.equipment.map((equipment, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {equipment}
                  <button
                    type="button"
                    onClick={() => removeEquipment(equipment)}
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
              {room ? 'Update' : 'Add'} Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}