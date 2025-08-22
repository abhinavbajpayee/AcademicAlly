import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";

// Shared
import Navbar from "./components/shared/Navbar";

// Dashboards
import StudentDashboard from "./components/dashboard/StudentDashboard";
import TeacherDashboard from "./components/dashboard/TeacherDashboard";

// Courses (Explore)
import CoursesPage from "./components/courses/CoursesPage";
import CourseDetailPage from "./components/courses/CourseDetailPage";
import AddCoursePage from "./components/courses/AddCoursePage"; // teacher adds courses

// Study Groups
import StudyGroupsPage from "./components/study-groups/StudyGroupsPage";
import StudyGroupDetailPage from "./components/study-groups/StudyGroupDetailPage";

// AI
import AIPage from "./components/ai/AIPage";

// Auth
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";

// Student extras
import ProfilePage from "./components/pages/ProfilePage";
import StudyRoomPage from "./components/pages/StudyRoomPage";
import FriendsPage from "./components/pages/FriendsPage";

// Teacher extras
import TeacherProfilePage from "./components/pages/TeacherProfilePage";
import TeacherClassesPage from "./components/pages/TeacherClassesPage";

const App = () => {
  const [currentPath, setCurrentPath] = useState("dashboard");
  const { user } = useAuth();

  const handleNavigate = (path) => {
    // Guard teacher-only route
    if (path === "add-course") {
      if (!user) return setCurrentPath("login");
      if (user.role !== "teacher") return setCurrentPath("courses");
    }

    // Private areas for logged-in users
    const privatePaths = [
      "dashboard",
      "ai-tutor",
      "profile",
      "study-room",
      "friends",
      "teacher-profile",
      "teacher-classes",
    ];
    if (privatePaths.includes(path) && !user) {
      setCurrentPath("login");
      return;
    }

    setCurrentPath(path);
  };

  const renderContent = () => {
    const [page, id] = currentPath.split("/");

    // Role-based dashboard
    if (page === "dashboard") {
      if (!user) return <LoginPage onNavigate={handleNavigate} />;
      return user.role === "teacher" ? (
        <TeacherDashboard onNavigate={handleNavigate} />
      ) : (
        <StudentDashboard onNavigate={handleNavigate} />
      );
    }

    switch (page) {
      // ===== Courses (Explore) =====
      case "courses":
        return <CoursesPage onNavigate={handleNavigate} />;

      case "course-detail":
        return <CourseDetailPage courseId={id} onNavigate={handleNavigate} />;

      case "add-course": // teacher-only (guarded above)
        return <AddCoursePage onNavigate={handleNavigate} />;

      // ===== Study Groups =====
      case "study-groups":
        return <StudyGroupsPage onNavigate={handleNavigate} />;

      case "study-group-detail":
        return (
          <StudyGroupDetailPage
            studyGroupId={id}
            onNavigate={handleNavigate}
          />
        );

      // ===== AI =====
      case "ai-tutor":
        return <AIPage />;

      // ===== Student pages =====
      case "profile":
        return <ProfilePage onNavigate={handleNavigate} />;

      case "study-room":
        return <StudyRoomPage onNavigate={handleNavigate} studyRoomId={id} />;

      case "friends":
        return <FriendsPage onNavigate={handleNavigate} />;

      // ===== Auth =====
      case "login":
        return <LoginPage onNavigate={handleNavigate} />;

      case "register":
        return <RegisterPage onNavigate={handleNavigate} />;

      // ===== Teacher pages =====
      case "teacher-profile":
        return <TeacherProfilePage />;

      case "teacher-classes":
        return <TeacherClassesPage />;

      default:
        return <div className="p-8">Page not found.</div>;
    }
  }; // <-- properly close renderContent

  // If logged in and currently on auth routes, bounce to dashboard
  useEffect(() => {
    if (user && (currentPath === "login" || currentPath === "register")) {
      setCurrentPath("dashboard");
    }
  }, [user, currentPath]);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans antialiased text-gray-800">
      <Navbar currentPath={currentPath} onNavigate={handleNavigate} />
      <div className="flex-grow pl-64 transition-all duration-300">
        <div className="p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default App;
