import React from 'react';
import CourseCard from '../courses/CourseCard';
import StudyGroupCard from '../study-groups/StudyGroupCard';
import { useAuth } from '../../context/AuthContext';
import { mockData } from '../../data/mockData';

const DashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  if (!user) {
    return <div className="p-8 text-center text-gray-500">Please log in to view your dashboard.</div>;
  }

  const userStudyGroups = mockData.studyGroups.filter(sg => sg.members.some(m => m.id === user.id));
  const userCourses = userStudyGroups.map(sg => mockData.courses.find(c => c.id === sg.courseId));
  const uniqueUserCourses = [...new Set(userCourses)];

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-4xl font-bold text-gray-800 mb-6">Welcome, {user.name}!</h2>

      <div className="bg-white rounded-xl shadow-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">My Enrolled Courses</h3>
        {uniqueUserCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueUserCourses.map(course => (
              <CourseCard key={course.id} course={course} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You are not enrolled in any courses yet.</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">My Study Groups</h3>
        {userStudyGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userStudyGroups.map(group => (
              <StudyGroupCard key={group.id} studyGroup={group} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You are not a member of any study groups yet.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
