import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useLocalStorage from "../../hooks/useLocalStorage";
import { Search, BookOpen } from "lucide-react";

export default function CoursesPage({ onNavigate }) {
  const { user } = useAuth();
  const [courses, setCourses] = useLocalStorage("courses_v1", []);
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("All");

  const filtered = useMemo(() => {
    const text = q.toLowerCase();
    return courses.filter((c) => {
      const matchesText =
        c.title.toLowerCase().includes(text) ||
        c.description.toLowerCase().includes(text) ||
        (c.tags || []).join(",").toLowerCase().includes(text);
      const matchesPlatform = platform === "All" || c.platform === platform;
      return matchesText && matchesPlatform;
    });
  }, [courses, q, platform]);

  const enroll = (courseId) => {
    if (!user) return onNavigate("login");
    const uid = user._id || user.id;
    setCourses((list) =>
      list.map((c) =>
        c.id !== courseId
          ? c
          : { ...c, enrolledUserIds: [...new Set([...(c.enrolledUserIds || []), uid])] }
      )
    );
  };

  const isEnrolled = (c) => {
    if (!user) return false;
    const uid = user._id || user.id;
    return (c.enrolledUserIds || []).includes(uid);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Explore Courses</h2>
        {user?.role === "teacher" && (
          <button
            onClick={() => onNavigate("add-course")}
            className="px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
          >
            Add Course
          </button>
        )}
      </div>

      {/* quick filter/search */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search size={18} className="text-gray-500" />
          <input
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Search by title, tag, description"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border rounded-lg"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option>All</option>
          <option>Udemy</option>
          <option>Coursera</option>
          <option>YouTube</option>
          <option>Custom</option>
        </select>
      </div>

      {/* list */}
      {filtered.length === 0 ? (
        <div className="text-gray-500">No courses found. Teachers can add one.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl shadow overflow-hidden flex flex-col">
              {c.thumbnail ? (
                <img src={c.thumbnail} alt={c.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-500">
                  <BookOpen className="opacity-60" />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold">{c.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mt-1">{c.description}</p>
                <div className="mt-2 text-xs text-gray-500">{c.platform} • by {c.teacherName}</div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {(c.tags || []).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs">{t}</span>
                  ))}
                </div>
                <div className="mt-auto pt-3 grid grid-cols-2 gap-2">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-center"
                  >
                    Open
                  </a>
                  {isEnrolled(c) ? (
                    <button className="px-3 py-2 rounded-lg bg-green-600 text-white" disabled>
                      Enrolled
                    </button>
                  ) : (
                    <button
                      onClick={() => enroll(c.id)}
                      className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* tiny debug helper – shows how many items are in storage */}
      <div className="text-xs text-gray-400">
        storage: courses_v1 • total: {courses.length}
      </div>
    </div>
  );
}
