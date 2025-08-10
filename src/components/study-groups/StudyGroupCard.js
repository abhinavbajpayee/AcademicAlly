import React from 'react';
import { Book, Users } from 'lucide-react';
import { mockData } from '../../data/mockData';

const StudyGroupCard = ({ studyGroup, onNavigate }) => {
  const course = mockData.courses.find(c => c.id === studyGroup.courseId);

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
      onClick={() => onNavigate(`study-group-detail/${studyGroup.id}`)}
    >
      <img src={studyGroup.imageUrl} alt={studyGroup.title} className="w-full h-40 object-cover" />
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{studyGroup.title}</h3>
        {course && (
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Book size={16} className="mr-2" />
            <span>{course.title}</span>
          </div>
        )}
        <div className="flex items-center text-sm text-gray-500">
          <Users size={16} className="mr-2" />
          <span>{studyGroup.members.length} members</span>
        </div>
      </div>
    </div>
  );
};

export default StudyGroupCard;
