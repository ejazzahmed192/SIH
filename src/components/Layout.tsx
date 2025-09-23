import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  Calendar,
  Users,
  BookOpen,
  MapPin,
  Settings,
  Home,
  FileDown,
  Brain,
  GraduationCap,
  Zap,
  ArrowLeft
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { state } = useTheme();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Faculty', href: '/faculty', icon: Users },
    { name: 'Rooms', href: '/rooms', icon: MapPin },
    { name: 'Students', href: '/students', icon: GraduationCap },
    { name: 'Timetables', href: '/timetables', icon: Calendar },
    { name: 'AI Generator', href: '/generator', icon: Brain },
    { name: 'Batch Generator', href: '/batch-generator', icon: Zap },
    { name: 'Export', href: '/export', icon: FileDown },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">TimetableAI</h1>
          </div>
          <Link
            to="/"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            title="Back to Home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
        <div className="px-6 py-2">
          <div className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            NEP 2020
          </div>
        </div>
        
        <nav className="mt-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="px-6 py-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
