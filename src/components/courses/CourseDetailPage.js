import React, { useState, useEffect } from 'react';
import { ArrowLeft, Book, Users } from 'lucide-react';
import StudyGroupCard from '../study-groups/StudyGroupCard';

const CourseDetailPage = ({ courseId, onNavigate }) => {
  const [course, setCourse] = useState(null);
  const [studyGroupsForCourse, setStudyGroupsForCourse] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseResponse = await fetch(`http://localhost:3001/api/courses/${courseId}`);
        const studyGroupsResponse = await fetch(`http://localhost:3001/api/study-groups`);

        if (!courseResponse.ok || !studyGroupsResponse.ok) {
          throw new Error('Failed to fetch data.');
        }

        const courseData = await courseResponse.json();
        const allStudyGroups = await studyGroupsResponse.json();

        setCourse(courseData);
        setStudyGroupsForCourse(allStudyGroups.filter(sg => sg.courseId === courseId));
      } catch (err) {
        console.error("Error fetching course detail data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  if (isLoading) return <div className="p-8 text-center">Loading course details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!course) return <div className="p-8">Course not found.</div>;

  return (
    <div className="p-8 space-y-8">
      <button
        onClick={() => onNavigate('courses')}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Courses
      </button>

      <div className="bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{course.title}</h2>
        <p className="text-lg text-gray-600 mb-6">{course.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-bold text-gray-700">Instructor:</p>
            <p className="text-gray-600">{course.instructor}</p>
          </div>
          <div>
            <p className="font-bold text-gray-700">Topics:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {course.topics.map((topic, index) => (
                <span key={index} className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Related Study Groups</h3>
        {studyGroupsForCourse.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyGroupsForCourse.map(group => (
              <StudyGroupCard key={group.id} studyGroup={group} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No study groups found for this course.</p>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;
