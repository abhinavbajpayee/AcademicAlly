import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useLocalStorage from "../../hooks/useLocalStorage";
import { ArrowLeft, ExternalLink, MessageSquarePlus } from "lucide-react";

const getYouTubeId = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "");
  } catch {}
  return null;
};

export default function CourseDetailPage({ courseId, onNavigate }) {
  const { user } = useAuth();
  const [courses, setCourses] = useLocalStorage("courses_v1", []);
  const [comment, setComment] = useState("");

  const course = useMemo(() => courses.find((c) => c.id === courseId), [courses, courseId]);

  const isEnrolled = useMemo(() => {
    if (!user || !course) return false;
    const uid = user._id || user.id;
    return (course.enrolledUserIds || []).includes(uid);
  }, [user, course]);

  const enroll = () => {
    if (!user) return onNavigate && onNavigate("login");
    setCourses((list) =>
      list.map((c) =>
        c.id !== courseId
          ? c
          : { ...c, enrolledUserIds: [...new Set([...(c.enrolledUserIds || []), user._id || user.id])] }
      )
    );
  };

  const addComment = () => {
    if (!user || !comment.trim()) return;
    const payload = {
      id: crypto.randomUUID(),
      userId: user._id || user.id,
      name: user.name || user.username || "User",
      text: comment.trim(),
      createdAt: Date.now(),
    };
    setCourses((list) => list.map((c) => (c.id === courseId ? { ...c, comments: [payload, ...(c.comments || [])] } : c)));
    setComment("");
  };

  if (!course) return <div className="p-4">Course not found.</div>;

  const yid = getYouTubeId(course.link);

  return (
    <div className="space-y-6">
      <button
        onClick={() => onNavigate && onNavigate("courses")}
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeft size={18} /> Back to Courses
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {course.thumbnail && (
            <img src={course.thumbnail} alt={course.title} className="w-full md:w-64 h-40 object-cover rounded-lg" />
          )}
          <div className="flex-1">
            <h2 className="text-3xl font-bold">{course.title}</h2>
            <p className="text-gray-600 mt-2">{course.description}</p>
            <div className="text-sm text-gray-500 mt-2">
              Platform: <span className="font-medium">{course.platform}</span> • By {course.teacherName}
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {(course.tags || []).map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs">{t}</span>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              {isEnrolled ? (
                <button className="px-4 py-2 rounded-lg bg-green-600 text-white" disabled>
                  Enrolled
                </button>
              ) : (
                <button onClick={enroll} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                  Enroll Now
                </button>
              )}
              <a
                href={course.link}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg border inline-flex items-center gap-2 hover:bg-gray-50"
              >
                Open Link <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Media / Embed */}
        <div className="mt-6">
          {yid ? (
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${yid}`}
                title={course.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-gray-50 text-sm text-gray-600">
              This platform may not allow embedding. Use the <b>Open Link</b> button above to view the content in a new tab.
            </div>
          )}
        </div>
      </div>

      {/* Teacher Advice */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-2">Teacher Advice</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{course.advice || "Stay consistent. Make notes and practice!"}</p>
      </div>

      {/* Comments / Q&A */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Discussion</h3>
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 px-3 py-2 border rounded-lg"
            placeholder="Ask a question or leave a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            onClick={addComment}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
          >
            <MessageSquarePlus size={18} /> Post
          </button>
        </div>
        <div className="space-y-3">
          {(course.comments || []).length === 0 && <div className="text-sm text-gray-500">No comments yet.</div>}
          {(course.comments || []).map((cm) => (
            <div key={cm.id} className="p-3 rounded-lg bg-gray-50">
              <div className="text-sm font-medium">{cm.name}</div>
              <div className="text-sm">{cm.text}</div>
              <div className="text-[10px] text-gray-500 mt-1">{new Date(cm.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
