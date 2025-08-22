// src/components/courses/CoursesPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useLocalStorage from "../../hooks/useLocalStorage";
import { Search, BookOpen, Copy, Check, Users } from "lucide-react";

const normalizeCourse = (c) => {
  const url = c.url || c.link || "";
  return {
    id: c.id || (crypto?.randomUUID?.() || String(Date.now())),
    title: c.title || "Untitled Course",
    description: c.description || "",
    platform: c.platform || "Custom",
    url,
    thumbnail: c.thumbnail || "",
    tags: Array.isArray(c.tags)
      ? c.tags
      : typeof c.tags === "string"
      ? c.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    advice: c.advice || "",
    teacherId: c.teacherId || "",
    teacherName: c.teacherName || "Instructor",
    createdAt: c.createdAt || Date.now(),
    enrolledUserIds: Array.isArray(c.enrolledUserIds) ? c.enrolledUserIds : [],
    comments: Array.isArray(c.comments) ? c.comments : [],
  };
};

export default function CoursesPage({ onNavigate }) {
  const { user } = useAuth();
  const [courses, setCourses] = useLocalStorage("courses_v1", []);

  // migrate once from "courses"
  const migratedRef = useRef(false);
  useEffect(() => {
    if (migratedRef.current) return;
    migratedRef.current = true;
    try {
      const legacyRaw = localStorage.getItem("courses");
      const legacy = legacyRaw ? JSON.parse(legacyRaw) : null;
      const merged = [
        ...(Array.isArray(legacy) ? legacy : []),
        ...(Array.isArray(courses) ? courses : []),
      ];
      if (!merged.length) return;
      const normalized = merged.map(normalizeCourse);
      const dedup = Array.from(new Map(normalized.map((c) => [c.id, c])).values());
      setCourses(dedup);
      if (legacyRaw) localStorage.removeItem("courses");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState("All");
  const [joinId, setJoinId] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const filtered = useMemo(() => {
    const text = q.toLowerCase();
    return (courses || []).filter((c) => {
      const matchesText =
        c.title.toLowerCase().includes(text) ||
        c.description.toLowerCase().includes(text) ||
        (c.tags || []).join(",").toLowerCase().includes(text);
      const matchesPlatform = platform === "All" || c.platform === platform;
      return matchesText && matchesPlatform;
    });
  }, [courses, q, platform]);

  const uid = user?._id || user?.id;

  const enroll = (courseId) => {
    if (!user) return onNavigate("login");
    setCourses((list) =>
      (list || []).map((c) =>
        c.id !== courseId
          ? c
          : { ...c, enrolledUserIds: [...new Set([...(c.enrolledUserIds || []), uid])] }
      )
    );
  };

  const leave = (courseId) => {
    if (!user) return;
    setCourses((list) =>
      (list || []).map((c) =>
        c.id !== courseId
          ? c
          : { ...c, enrolledUserIds: (c.enrolledUserIds || []).filter((x) => x !== uid) }
      )
    );
  };

  const enrollById = () => {
    const id = joinId.trim();
    if (!id) return;
    const target = (courses || []).find((c) => c.id === id);
    if (!target) return window.alert("No course found for this Course ID.");
    enroll(target.id);
    setJoinId("");
    window.alert(`Joined: ${target.title}`);
  };

  const isEnrolled = (c) => !!uid && (c.enrolledUserIds || []).includes(uid);
  const isOwner = (c) => !!uid && c.teacherId === uid; // <-- owner check
  const enrolledCount = (c) => (c.enrolledUserIds ? c.enrolledUserIds.length : 0);
  const shortId = (id) => id.slice(0, 8);

  const copyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      window.alert(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Student: Join via Course ID */}
      {user?.role !== "teacher" && (
        <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-2 items-center">
          <input
            className="flex-1 min-w-[220px] px-3 py-2 border rounded-lg"
            placeholder="Enter Course ID to join"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enrollById()}
          />
          <button
            onClick={enrollById}
            className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Join by ID
          </button>
        </div>
      )}

      {/* Filters */}
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

      {/* List */}
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
                {/* title + copyable id */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <button
                    onClick={() => copyId(c.id)}
                    className="text-[11px] px-2 py-1 rounded-full border hover:bg-gray-50 flex items-center gap-1"
                    title={c.id}
                  >
                    {copiedId === c.id ? <Check size={12} /> : <Copy size={12} />}
                    {shortId(c.id)}
                  </button>
                </div>

                <p className="text-sm text-gray-600 line-clamp-3 mt-1">{c.description}</p>

                <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                  <span>{c.platform} • by {c.teacherName}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100">
                    <Users size={12} /> {enrolledCount(c)}
                  </span>
                </div>

                <div className="mt-2 flex gap-2 flex-wrap">
                  {(c.tags || []).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs">
                      {t}
                    </span>
                  ))}
                </div>

                {/* ACTIONS */}
                <div className="mt-auto pt-3 grid grid-cols-2 gap-2">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-lg border hover:bg-gray-50 text-center"
                  >
                    Open
                  </a>

                  {isOwner(c) ? (
  <button
    onClick={() => onNavigate(`course-detail/${c.id}`)}
    className="px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
  >
    Discuss
  </button>
) : isEnrolled(c) ? (
  <button
    onClick={() => leave(c.id)}
    className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
  >
    Leave
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

      {/* tiny debug footer */}
      <div className="text-xs text-gray-400">
        storage: <code>courses_v1</code> • total: {courses?.length || 0}
      </div>
    </div>
  );
}
