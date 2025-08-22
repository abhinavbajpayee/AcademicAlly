import { useEffect, useMemo, useState } from "react";
import CourseDiscussion from "./CourseDiscussion";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft, Users } from "lucide-react";

export default function CourseDetailPage({ courseId, onNavigate }) {
  const { user } = useAuth();
  const [list, setList] = useLocalStorage("courses_v1", []);
  const [apiCourse, setApiCourse] = useState(null); // fallback if not found in local
  const [loading, setLoading] = useState(false);

  const course = useMemo(() => list.find((c) => c.id === courseId), [list, courseId]) || apiCourse;

  useEffect(() => {
    if (course) return;
    // fallback to API (older flow), safe-guard
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`http://localhost:3001/api/courses/${courseId}`);
        if (r.ok) {
          const data = await r.json();
          setApiCourse({
            id: data._id || courseId,
            title: data.title || "Untitled Course",
            description: data.description || "",
            platform: data.platform || "Custom",
            url: data.url || data.link || "",
            thumbnail: data.thumbnail || "",
            tags: data.tags || [],
            advice: data.advice || "",
            teacherId: data.teacherId || "",
            teacherName: data.teacherName || "Instructor",
            createdAt: Date.now(),
            enrolledUserIds: data.enrolledUserIds || [],
            comments: [],
          });
        }
      } catch {}
      setLoading(false);
    })();
  }, [course, courseId]);

  const uid = user?._id || user?.id;
  const isOwner = course && uid && course.teacherId === uid;
  const isEnrolled = course && uid && (course.enrolledUserIds || []).includes(uid);
  const enrolledCount = course?.enrolledUserIds ? course.enrolledUserIds.length : 0;

  const enroll = () => {
    if (!uid) return onNavigate("login");
    setList((arr) =>
      (arr || []).map((c) =>
        c.id === courseId
          ? { ...c, enrolledUserIds: [...new Set([...(c.enrolledUserIds || []), uid])] }
          : c
      )
    );
  };

  const leave = () => {
    if (!uid) return;
    setList((arr) =>
      (arr || []).map((c) =>
        c.id === courseId
          ? { ...c, enrolledUserIds: (c.enrolledUserIds || []).filter((x) => x !== uid) }
          : c
      )
    );
  };

  if (loading && !course) return <div className="p-8 text-center">Loading…</div>;
  if (!course) return <div className="p-8">Course not found.</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => onNavigate("courses")}
        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeft size={16} /> Back to Courses
      </button>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full md:w-64 h-40 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full md:w-64 h-40 bg-gray-100 rounded-lg" />
          )}

        <div className="flex-1">
          <h2 className="text-3xl font-bold">{course.title}</h2>
          <p className="text-gray-600 mt-2">{course.description}</p>
          <div className="mt-2 text-sm text-gray-500">
            {course.platform} • by {course.teacherName}
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
              <Users size={14} /> {enrolledCount} Enrolled
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            {course.url && (
              <a
                href={course.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                Open Resource
              </a>
            )}

            {/* Actions: Owner sees Manage; students see Enroll/Leave */}
            {isOwner ? (
              <button
                onClick={() => onNavigate("teacher-classes")}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black"
              >
                Manage
              </button>
            ) : isEnrolled ? (
              <button
                onClick={leave}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Leave
              </button>
            ) : (
              <button
                onClick={enroll}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Enroll
              </button>
            )}
          </div>

          {/* tags */}
          <div className="mt-3 flex gap-2 flex-wrap">
            {(course.tags || []).map((t) => (
              <span key={t} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* 🔥 Discussion always visible (teacher + students) */}
      <CourseDiscussion courseId={course.id} />
    </div>
  );
}
