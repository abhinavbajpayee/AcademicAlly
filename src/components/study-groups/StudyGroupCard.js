import React from 'react';
import { Users } from 'lucide-react'; // ⚡ removed Book

const StudyGroupCard = ({ studyGroup, onNavigate }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
      onClick={() => onNavigate(`study-group-detail/${studyGroup._id}`)}
    >
      <img
        src={studyGroup.imageUrl}
        alt={studyGroup.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{studyGroup.title}</h3>
        <div className="flex items-center text-sm text-gray-500">
          <Users size={16} className="mr-2" />
          <span>{studyGroup.members.length} members</span>
        </div>
      </div>
    </div>
  );
};

export default StudyGroupCard;
