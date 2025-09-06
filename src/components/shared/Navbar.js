// src/components/shared/Navbar.jsx
import React from "react";

const NavItem = ({ active, onClick, icon, label, badge }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      active ? "bg-white/10 text-white font-semibold" : "text-white/90 hover:bg-white/5"
    }`}
  >
    <span className="w-5 h-5 flex items-center justify-center" aria-hidden>
      {icon}
    </span>
    <span className="flex-1">{label}</span>
    {badge ? <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{badge}</span> : null}
  </button>
);

export default function Navbar({ currentPath = "dashboard", onNavigate = () => {} }) {
  // mapping for active checks (handles subpaths like "course-detail/123")
  const isActive = (key) => currentPath === key || currentPath.startsWith(`${key}/`);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-[#2f2a86] to-[#221e63] text-white p-6 flex flex-col justify-between shadow-lg">
      <div>
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center text-xl font-bold">
            AA
          </div>
          <div>
            <div className="text-lg font-bold leading-tight">Academic Ally</div>
            <div className="text-xs text-white/80">Student — Teacher Hub</div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem
            active={isActive("dashboard")}
            onClick={() => onNavigate("dashboard")}
            label="Dashboard"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" fill="currentColor"/></svg>
            }
          />

          <NavItem
            active={isActive("courses")}
            onClick={() => onNavigate("courses")}
            label="Courses"
            badge={3}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16v2H4zM4 10h16v2H4zM4 14h10v2H4z" fill="currentColor"/></svg>
            }
          />

          <NavItem
            active={isActive("study-groups")}
            onClick={() => onNavigate("study-groups")}
            label="Study Groups"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-3.31 0-10 1.67-10 5v3h20v-3c0-3.33-6.69-5-10-5z" fill="currentColor"/></svg>}
          />

          <div className="mt-3 border-t border-white/10 pt-3" />

          <NavItem
            active={isActive("career-advisor")}
            onClick={() => onNavigate("career-advisor")}
            label="Career Advisor"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 0 1 7 7v2h1a1 1 0 0 1 1 1v6h-2v4H5v-4H3v-6a1 1 0 0 1 1-1h1V9a7 7 0 0 1 7-7z" fill="currentColor"/></svg>}
          />

          <NavItem
            active={isActive("internships")}
            onClick={() => onNavigate("internships")}
            label="Internships"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6H4v12h16V6zm-9 8H7v-2h4v2zm6 0h-4v-2h4v2z" fill="currentColor"/></svg>}
          />

          <NavItem
            active={isActive("mentorships")}
            onClick={() => onNavigate("mentorships")}
            label="Mentorships"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-8 9v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1H4z" fill="currentColor"/></svg>}
          />

          <NavItem
            active={isActive("ai-tutor")}
            onClick={() => onNavigate("ai-tutor")}
            label="AI Tutor"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l4 4-4 4-4-4 4-4zm0 6l4 4-4 4-4-4 4-4z" fill="currentColor"/></svg>}
          />

          <div className="mt-3 border-t border-white/10 pt-3" />

          <NavItem
            active={isActive("profile")}
            onClick={() => onNavigate("profile")}
            label="Profile"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4 0-8 2-8 6h16c0-4-4-6-8-6z" fill="currentColor"/></svg>}
          />

          <NavItem
            active={isActive("study-room")}
            onClick={() => onNavigate("study-room")}
            label="Study Room"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3h18v14H3zM6 18v3h12v-3" fill="currentColor"/></svg>}
          />

          <NavItem
            active={isActive("friends")}
            onClick={() => onNavigate("friends")}
            label="Friends"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zM8 13c-2.33 0-7 1.17-7 3.5V20h14v-3.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/></svg>}
          />
        </nav>
      </div>

      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <img src={`https://ui-avatars.com/api/?name=Abhinav+B`} alt="avatar" className="w-10 h-10 rounded-full bg-white/10" />
          <div className="flex-1">
            <div className="text-sm font-semibold">Abhinav Bajpai</div>
            <div className="text-xs text-white/80">3rd Year • CSE</div>
          </div>
          <button
            onClick={() => onNavigate("logout")}
            className="ml-2 bg-red-500 px-3 py-1 rounded-md text-sm hover:bg-red-600"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
