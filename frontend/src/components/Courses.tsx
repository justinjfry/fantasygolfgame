import React, { useState, useEffect } from 'react';
import { MapPin, Flag, Star } from 'lucide-react';
import axios from 'axios';

interface Course {
  id: string;
  name: string;
  holes: number;
  par: number;
  difficulty: string;
  description: string;
}

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'championship':
        return 'text-red-600 bg-red-100';
      case 'professional':
        return 'text-orange-600 bg-orange-100';
      case 'amateur':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MapPin className="h-8 w-8 text-golf-green" />
        <h1 className="text-3xl font-bold text-white font-golf">Golf Courses</h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="golf-card rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold">{course.name}</h3>
              <Flag className="h-6 w-6 text-golf-green" />
            </div>
            
            <p className="text-gray-600 mb-4">{course.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Holes:</span>
                <span className="font-medium">{course.holes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Par:</span>
                <span className="font-medium">{course.par}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Difficulty:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="golf-card rounded-xl p-12 text-center">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Courses Available</h3>
          <p className="text-gray-500">Check back later for new courses!</p>
        </div>
      )}
    </div>
  );
}; 