import React, { useState, useEffect } from 'react';
import StudyGroupCard from './StudyGroupCard';

const StudyGroupsPage = ({ onNavigate }) => {
  const [studyGroups, setStudyGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudyGroups = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/study-groups');
        if (!response.ok) {
          throw new Error('Failed to fetch study groups');
        }
        const data = await response.json();
        setStudyGroups(data);
      } catch (err) {
        console.error("Error fetching study groups:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudyGroups();
  }, []);

  if (isLoading) return <div className="p-8 text-center">Loading study groups...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <h2 className="text-4xl font-bold text-gray-800 mb-6">Explore Study Groups</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyGroups.map(group => (
          <StudyGroupCard key={group.id} studyGroup={group} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
};

export default StudyGroupsPage;
