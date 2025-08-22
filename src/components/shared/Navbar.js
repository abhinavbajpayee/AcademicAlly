// components/shared/Navbar.js
import { useAuth } from "../../context/AuthContext";
import { LogOut, LayoutDashboard, BookOpen, Users, Bot, User, Home, UserPlus } from "lucide-react";

const Navbar = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();

  const links = [
    { name: "Dashboard", path: "dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Courses", path: "courses", icon: <BookOpen size={18} /> },
    { name: "Study Groups", path: "study-groups", icon: <Users size={18} /> },
    { name: "AI Tutor", path: "ai-tutor", icon: <Bot size={18} /> },
    { name: "Profile", path: "profile", icon: <User size={18} /> }, // 🟢 Profile added
    { name: "Study Room", path: "study-room", icon: <Home size={18} /> }, // 🟢 Study Room added
    { name: "Friends", path: "friends", icon: <UserPlus size={18} /> }, // 🟢 Friends added
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                currentPath.startsWith(link.path)
                  ? "bg-indigo-700 font-semibold"
                  : "hover:bg-indigo-800"
              }`}
            >
              {link.icon}
              {link.name}
            </button>
          ))}
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
