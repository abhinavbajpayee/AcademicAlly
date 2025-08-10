import React from 'react';
import {
  LayoutDashboard,
  Book,
  Users,
  Bot,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import NavLink from './NavLink';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('dashboard');
  };

  return (
    <nav className="fixed top-0 left-0 w-64 h-full bg-indigo-800 p-4 shadow-lg text-white">
      <div className="flex flex-col h-full">
        <h1 className="text-2xl font-bold mb-8 text-center">Academic Ally</h1>
        <ul className="space-y-2 flex-grow">
          <NavLink to="dashboard" currentPath={currentPath} onNavigate={onNavigate}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="courses" currentPath={currentPath} onNavigate={onNavigate}>
            <Book size={20} />
            Courses
          </NavLink>
          <NavLink to="study-groups" currentPath={currentPath} onNavigate={onNavigate}>
            <Users size={20} />
            Study Groups
          </NavLink>
          <NavLink to="ai-tutor" currentPath={currentPath} onNavigate={onNavigate}>
            <Bot size={20} />
            AI Tutor
          </NavLink>
        </ul>
        <div className="mt-auto pt-4 border-t border-indigo-700">
          {user ? (
            <div className="flex flex-col items-center">
              <span className="mb-2 font-medium">Hello, {user.name}!</span>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <NavLink to="login" currentPath={currentPath} onNavigate={onNavigate}>
                <LogIn size={20} />
                Login
              </NavLink>
              <NavLink to="register" currentPath={currentPath} onNavigate={onNavigate}>
                <UserPlus size={20} />
                Register
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
