import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const StudyGroupDetailPage = ({ studyGroupId, onNavigate }) => {
  const [studyGroup, setStudyGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudyGroup = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/study-groups/${studyGroupId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch study group details');
        }
        const data = await response.json();
        setStudyGroup(data);
      } catch (err) {
        console.error("Error fetching study group data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudyGroup();
  }, [studyGroupId]);

  if (isLoading) return <div className="p-8 text-center">Loading study group...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!studyGroup) return <div className="p-8">Study group not found.</div>;

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
