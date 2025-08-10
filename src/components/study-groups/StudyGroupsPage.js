import React from 'react';
import StudyGroupCard from './StudyGroupCard';
import { mockData } from '../../data/mockData';

const StudyGroupsPage = ({ onNavigate }) => (
  <div className="p-8">
    <h2 className="text-4xl font-bold text-gray-800 mb-6">Explore Study Groups</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockData.studyGroups.map(group => (
        <StudyGroupCard key={group.id} studyGroup={group} onNavigate={onNavigate} />
      ))}
    </div>
  </div>
);

export default StudyGroupsPage;
