import React from 'react';
import { Book } from 'lucide-react';

const CourseCard = ({ course, onNavigate }) => (
  <div
    className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
    onClick={() => onNavigate(`course-detail/${course.id}`)}
  >
    <img src={course.imageUrl} alt={course.title} className="w-full h-40 object-cover" />
    <div className="p-5">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{course.title}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
      <div className="flex items-center text-sm text-gray-500">
        <Book size={16} className="mr-2" />
        <span>{course.instructor}</span>
      </div>
    </div>
  </div>
);

export default CourseCard;
