import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check } from 'lucide-react'; // ⚡ removed Users
import { useAuth } from '../../context/AuthContext';

const StudyGroupDetailPage = ({ studyGroupId, onNavigate }) => {
  const [studyGroup, setStudyGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [isMember, setIsMember] = useState(false);

  const fetchStudyGroup = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/study-groups/${studyGroupId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch study group details');
      }
      const data = await response.json();
      setStudyGroup(data);
      if (user) {
        setIsMember(data.members.some(member => member._id === user._id));
      }
    } catch (err) {
      console.error("Error fetching study group data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [studyGroupId, user]);

  useEffect(() => {
    fetchStudyGroup();
  }, [fetchStudyGroup]);

  const handleJoinGroup = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/study-groups/${studyGroupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      });

      if (!response.ok) {
        throw new Error('Failed to join group');
      }

      await fetchStudyGroup(); // ✅ re-fetch after joining
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join the group. Please try again.');
    }
  };

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
        {studyGroup.courseId && (
          <p className="text-lg text-gray-600 mb-2">
            Part of: <span className="font-semibold">{studyGroup.courseId.title}</span>
          </p>
        )}
        <p className="text-md text-gray-500 mb-6">{studyGroup.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-bold text-gray-700 mb-2">Members:</p>
            <div className="flex flex-wrap gap-2">
              {studyGroup.members.map((member, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full"
                >
                  {member.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {user && (
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          {isMember ? (
            <div className="flex items-center justify-center text-green-600 font-bold text-lg gap-2">
              <Check size={24} /> You are a member of this group.
            </div>
          ) : (
            <button
              onClick={handleJoinGroup}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Join This Group
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyGroupDetailPage;
