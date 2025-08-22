import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CourseCard = ({ course, onNavigate, isMember, refreshDashboard }) => {
  const { user } = useAuth();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(isMember);

  const handleJoin = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    try {
      setJoining(true);
      const response = await fetch(`http://localhost:3001/api/courses/${course._id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });

      if (!response.ok) throw new Error('Failed to join course');

      setJoined(true);
      refreshDashboard && refreshDashboard(); // ✅ dashboard update
    } catch (err) {
      console.error("Join course error:", err);
      alert("Failed to join course. Try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="h-24 bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
        {course.title}
      </div>
      <div className="p-5 space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">{course.subtitle}</h3>
        <p className="text-sm text-gray-600">{course.description}</p>
        <p className="text-sm text-gray-500">👤 {course.instructor}</p>

        {!joined ? (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {joining ? "Joining..." : "Join Now"}
          </button>
        ) : (
          <>
            <button
              onClick={() => onNavigate(`course-detail/${course._id}`)}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              View Details
            </button>
            <div className="flex items-center justify-center text-green-600 font-bold text-sm mt-2">
              <Check size={16} className="mr-1" /> You're a member!
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
