import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  Calendar,
  Brain,
  Users,
  BookOpen,
  MapPin,
  Zap,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  Globe,
  Clock,
  Target,
  Award,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const { state } = useTheme();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Generation',
      description: 'Advanced algorithms create conflict-free timetables automatically',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Zap,
      title: 'Batch Processing',
      description: 'Generate timetables for multiple programs simultaneously',
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      icon: Target,
      title: 'NEP 2020 Compliant',
      description: 'Fully aligned with National Education Policy guidelines',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: Shield,
      title: 'Conflict Resolution',
      description: 'Intelligent detection and resolution of scheduling conflicts',
      color: 'text-purple-600 dark:text-purple-400'
    }
  ];

  const stats = [
    { number: '50+', label: 'Institutions', icon: Globe },
    { number: '10K+', label: 'Students', icon: Users },
    { number: '99.9%', label: 'Accuracy', icon: Target },
    { number: '24/7', label: 'Support', icon: Clock }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('animate-fade-in-up');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/5 dark:to-purple-400/5"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium mb-8 ${isVisible ? 'animate-fade-in-down' : 'opacity-0'}`}>
              <Sparkles className="h-4 w-4 mr-2" />
              NEP 2020 Compliant • AI-Powered • Production Ready
            </div>

            <h1 className={`text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 delay-200`}>
              Smart Academic
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Timetable Generator
              </span>
            </h1>

            <p className={`text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 delay-400`}>
              Revolutionize your institution's scheduling with AI-powered timetable generation. 
              Create conflict-free, optimized schedules for FYUP, B.Ed, M.Ed, and ITEP programs.
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} transition-all duration-1000 delay-600`}>
              <Link
                to="/dashboard"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
              <Link
                to="/generator"
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transform hover:scale-105 transition-all duration-300"
              >
                <Brain className="mr-2 h-5 w-5" />
                Try AI Generator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Modern Education
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to manage academic schedules efficiently and effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-500 animate-on-scroll border border-gray-100 dark:border-gray-700 ${
                    currentFeature === index ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                  }`}
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="text-center animate-on-scroll group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6 animate-on-scroll">
            Ready to Transform Your Academic Scheduling?
          </h2>
          <p className="text-xl text-blue-100 mb-8 animate-on-scroll">
            Join thousands of institutions already using our AI-powered timetable generator
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-on-scroll">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Start Creating Timetables
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transform hover:scale-105 transition-all duration-300"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Calendar className="h-8 w-8 text-blue-400 mr-3" />
                <span className="text-2xl font-bold">TimetableAI</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The most advanced AI-powered academic timetable generator, designed for modern educational institutions following NEP 2020 guidelines.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-400">4.9/5 Rating</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 text-blue-400 mr-1" />
                  <span className="text-sm text-gray-400">NEP 2020 Certified</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/generator" className="text-gray-400 hover:text-white transition-colors">AI Generator</Link></li>
                <li><Link to="/courses" className="text-gray-400 hover:text-white transition-colors">Courses</Link></li>
                <li><Link to="/faculty" className="text-gray-400 hover:text-white transition-colors">Faculty</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/settings" className="text-gray-400 hover:text-white transition-colors">Settings</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 TimetableAI. All rights reserved. Built with ❤️ for modern education.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}