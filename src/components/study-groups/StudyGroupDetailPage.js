import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { mockData } from '../../data/mockData';

const StudyGroupDetailPage = ({ studyGroupId, onNavigate }) => {
  const studyGroup = mockData.studyGroups.find(sg => sg.id === studyGroupId);

  if (!studyGroup) {
    return <div className="p-8">Study group not found.</div>;
  }

  const course = mockData.courses.find(c => c.id === studyGroup.courseId);

  return (
    <div className="p-8 space-y-8">
      <button
        onClick={() => onNavigate('study-groups')}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Study Groups
      </button>

      <div className="bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{studyGroup.title}</h2>
        {course && <p className="text-lg text-gray-600 mb-2">Part of: <span className="font-semibold">{course.title}</span></p>}
        <p className="text-md text-gray-500 mb-6">{studyGroup.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-bold text-gray-700 mb-2">Members:</p>
            <div className="flex flex-wrap gap-2">
              {studyGroup.members.map((member, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {member.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroupDetailPage;
