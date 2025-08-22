// components/shared/Navbar.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  LogOut,
  LayoutDashboard,
  BookOpen,
  Users,
  Bot,
  User,
  Home,
  UserPlus,
  PlusCircle,
} from "lucide-react";

const Navbar = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();

  const [courseCount, setCourseCount] = useState(0);

  // Read courses_v1 from localStorage to show a badge
  const refreshCourseCount = () => {
    try {
      const raw = localStorage.getItem("courses_v1");
      const arr = raw ? JSON.parse(raw) : [];
      setCourseCount(Array.isArray(arr) ? arr.length : 0);
    } catch {
      setCourseCount(0);
    }
  };

  useEffect(() => {
    refreshCourseCount();

    // Storage event fires across tabs; call refresh when it happens
    const onStorage = (e) => {
      if (e.key === "courses_v1") refreshCourseCount();
    };
    window.addEventListener("storage", onStorage);

    // Also refresh when route changes (same tab writes don't trigger 'storage')
    // currentPath prop changes on navigation, so we can re-check
    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [currentPath]);

  const links = [
    { name: "Dashboard", path: "dashboard", icon: <LayoutDashboard size={18} /> },
    {
      name: "Courses",
      path: "courses",
      icon: <BookOpen size={18} />,
      // show a count badge
      badge: courseCount,
    },
    { name: "Study Groups", path: "study-groups", icon: <Users size={18} /> },
    { name: "AI Tutor", path: "ai-tutor", icon: <Bot size={18} /> },
    { name: "Profile", path: "profile", icon: <User size={18} /> },
    { name: "Study Room", path: "study-room", icon: <Home size={18} /> },
    { name: "Friends", path: "friends", icon: <UserPlus size={18} /> },
  ];

  return (
    <div className="w-64 bg-indigo-900 text-white fixed h-screen flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold p-6">Academic Ally</h2>

        <nav className="flex flex-col gap-2 px-4">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => onNavigate(link.path)}
              className={`flex items-center justify-between gap-2 px-4 py-2 rounded-lg transition ${
                currentPath.startsWith(link.path)
                  ? "bg-indigo-700 font-semibold"
                  : "hover:bg-indigo-800"
              }`}
            >
              <span className="flex items-center gap-2">
                {link.icon}
                {link.name}
              </span>

              {typeof link.badge === "number" && link.badge > 0 && (
                <span className="text-xs bg-white/15 px-2 py-0.5 rounded-full">
                  {link.badge}
                </span>
              )}
            </button>
          ))}

          {/* Teacher-only quick action: Add Course */}
          {user?.role === "teacher" && (
            <button
              onClick={() => onNavigate("add-course")}
              className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-lg transition bg-emerald-700 hover:bg-emerald-600`}
              title="Add a new course"
            >
              <PlusCircle size={18} />
              Add Course
            </button>
          )}
        </nav>
      </div>

      <div className="p-4 border-t border-indigo-800">
        {user && <p className="mb-2">Hello, {user.name || "!"}</p>}
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
