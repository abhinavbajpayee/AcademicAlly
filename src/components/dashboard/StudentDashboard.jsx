import { useMemo } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Users } from "lucide-react";

export default function StudentDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [courses, setCourses] = useLocalStorage("courses_v1", []);
  const uid = user?._id || user?.id;

  const myCourses = useMemo(() => {
    if (!uid) return [];
    return (courses || []).filter((c) => (c.enrolledUserIds || []).includes(uid));
  }, [courses, uid]);

  const discover = useMemo(() => {
    if (!uid) return courses || [];
    return (courses || []).filter((c) => !(c.enrolledUserIds || []).includes(uid));
  }, [courses, uid]);

  const unenroll = (courseId) => {
    if (!uid) return;
    setCourses((list) =>
      (list || []).map((c) =>
        c.id !== courseId
          ? c
          : { ...c, enrolledUserIds: (c.enrolledUserIds || []).filter((x) => x !== uid) }
      )
    );
  };

  const enrolledCount = (c) => (c.enrolledUserIds ? c.enrolledUserIds.length : 0);

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold">Welcome, {user?.name}!</h2>

      {/* My Enrolled Courses */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold">My Enrolled Courses</h3>
          <button
            onClick={() => onNavigate("courses")}
            className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Browse All
          </button>
        </div>

        {myCourses.length === 0 ? (
          <p className="text-gray-500">You haven’t enrolled yet. Discover courses below.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
                {c.thumbnail ? (
                  <img src={c.thumbnail} alt={c.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-500">
                    <BookOpen />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{c.title}</h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs">
                      <Users size={12} /> {enrolledCount(c)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
                    <button
                      onClick={() => onNavigate(`course-detail/${c.id}`)}
                      className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => unenroll(c.id)}
                      className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                      Unenroll
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discover (not enrolled yet) — optional but useful */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-2xl font-semibold mb-4">Discover Courses</h3>
        {discover.length === 0 ? (
          <p className="text-gray-500">No more courses to discover. Check back later.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {discover.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
                {c.thumbnail ? (
                  <img src={c.thumbnail} alt={c.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-500">
                    <BookOpen />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-semibold">{c.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
                  <div className="mt-3">
                    <button
                      onClick={() => onNavigate("courses")}
                      className="w-full px-3 py-2 rounded-lg border hover:bg-gray-50"
                    >
                      View in Courses
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
