import React from 'react';
import CourseCard from './CourseCard';
import { mockData } from '../../data/mockData';

const CoursesPage = ({ onNavigate }) => (
  <div className="p-8">
    <h2 className="text-4xl font-bold text-gray-800 mb-6">Explore Courses</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockData.courses.map(course => (
        <CourseCard key={course.id} course={course} onNavigate={onNavigate} />
      ))}
    </div>
  </div>
);

export default CoursesPage;
