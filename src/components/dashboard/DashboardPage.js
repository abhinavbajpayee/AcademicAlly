import { useAuth } from '../../context/AuthContext';

const DashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Welcome {user.role === 'teacher' ? 'Teacher' : 'Student'}!
      </h1>

      {user.role === 'student' ? (
        <>
          <button
            className="mb-4 bg-green-600 text-white p-3 rounded hover:bg-green-700"
            onClick={() => onNavigate('courses')}
          >
            Browse Courses
          </button>
          <button
            className="mb-4 ml-4 bg-purple-600 text-white p-3 rounded hover:bg-purple-700"
            onClick={() => onNavigate('study-groups')}
          >
            Join Study Groups
          </button>
          <button
            className="ml-4 bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
            onClick={() => onNavigate('ai-tutor')}
          >
            AI Tutor
          </button>
        </>
      ) : (
        <>
          <button
            className="mb-4 bg-orange-600 text-white p-3 rounded hover:bg-orange-700"
            onClick={() => alert('Feature: Create a new course')}
          >
            Create Course
          </button>
          <button
            className="ml-4 bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700"
            onClick={() => alert('Feature: Manage your study groups')}
          >
            Manage Study Groups
          </button>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
