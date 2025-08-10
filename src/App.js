import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/shared/Navbar';
import DashboardPage from './components/dashboard/DashboardPage';
import CoursesPage from './components/courses/CoursesPage';
import CourseDetailPage from './components/courses/CourseDetailPage';
import StudyGroupsPage from './components/study-groups/StudyGroupsPage';
import StudyGroupDetailPage from './components/study-groups/StudyGroupDetailPage';
import AIPage from './components/ai/AIPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';

const App = () => {
  const [currentPath, setCurrentPath] = useState('dashboard');
  const { user } = useAuth();

  const handleNavigate = (path) => {
    const privatePaths = ['dashboard', 'ai-tutor'];
    if (privatePaths.includes(path) && !user) {
      setCurrentPath('login');
      return;
    }
    setCurrentPath(path);
  };

  const renderContent = () => {
    const [page, id] = currentPath.split('/');
    switch (page) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'courses':
        return <CoursesPage onNavigate={handleNavigate} />;
      case 'course-detail':
        return <CourseDetailPage courseId={id} onNavigate={handleNavigate} />;
      case 'study-groups':
        return <StudyGroupsPage onNavigate={handleNavigate} />;
      case 'study-group-detail':
        return <StudyGroupDetailPage studyGroupId={id} onNavigate={handleNavigate} />;
      case 'ai-tutor':
        return <AIPage />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      default:
        return <div className="p-8">Page not found.</div>;
    }
  };

  useEffect(() => {
    if (user && (currentPath === 'login' || currentPath === 'register')) {
      setCurrentPath('dashboard');
    }
  }, [user, currentPath]);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans antialiased text-gray-800">
      <Navbar currentPath={currentPath} onNavigate={handleNavigate} />
      <div className="flex-grow pl-64 transition-all duration-300">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;
