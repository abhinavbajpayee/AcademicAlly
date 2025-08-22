import React from "react";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Users2, Megaphone, Pencil } from "lucide-react";

const Card = ({ title, desc, icon, onClick, cta = "Open" }) => (
  <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
    <div>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600">{desc}</p>
    </div>
    <button
      onClick={onClick}
      className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
    >
      <Pencil size={16} /> {cta}
    </button>
  </div>
);

export default function TeacherDashboard({ onNavigate }) {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-gray-800">Welcome, {user?.name || "Teacher"} 👋</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Profile"
          desc="Edit bio, subjects, experience and links (LinkedIn, Scholar, etc.)."
          icon={<Users2 className="text-indigo-600" />}
          onClick={() => onNavigate("teacher-profile")}
          cta="Edit Profile"
        />
        <Card
          title="Classes / Rooms"
          desc="Create and manage your study rooms, approve students, post info."
          icon={<BookOpen className="text-indigo-600" />}
          onClick={() => onNavigate("teacher-classes")}
          cta="Manage Rooms"
        />
        <Card
          title="Announcements"
          desc="Create simple announcements for your rooms (frontend only)."
          icon={<Megaphone className="text-indigo-600" />}
          onClick={() => onNavigate("teacher-classes")} // same page has announcements area
          cta="Open"
        />
      </div>
    </div>
  );
}
