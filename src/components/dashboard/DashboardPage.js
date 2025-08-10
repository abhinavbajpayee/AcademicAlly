import React, { useState, useEffect } from 'react';
import CourseCard from '../courses/CourseCard';
import StudyGroupCard from '../study-groups/StudyGroupCard';
import { useAuth } from '../../context/AuthContext';

const DashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [userStudyGroups, setUserStudyGroups] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const studyGroupsResponse = await fetch('http://localhost:3001/api/study-groups');
        const coursesResponse = await fetch('http://localhost:3001/api/courses');

        if (!studyGroupsResponse.ok || !coursesResponse.ok) {
          throw new Error('Failed to fetch data.');
        }

        const allStudyGroups = await studyGroupsResponse.json();
        const allCourses = await coursesResponse.json();

        const filteredGroups = allStudyGroups.filter(sg =>
          sg.members.some(member => member.id === user.id)
        );
        setUserStudyGroups(filteredGroups);

        const courseIds = new Set(filteredGroups.map(g => g.courseId));
        const filteredCourses = allCourses.filter(c => courseIds.has(c.id));
        setUserCourses(filteredCourses);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user) {
    return <div className="p-8 text-center text-gray-500">Please log in to view your dashboard.</div>;
  }

  if (isLoading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-4xl font-bold text-gray-800 mb-6">Welcome, {user.name}!</h2>

      <div className="bg-white rounded-xl shadow-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">My Enrolled Courses</h3>
        {userCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCourses.map(course => (
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
