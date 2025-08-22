import useLocalStorage from "../../hooks/useLocalStorage";
import { useAuth } from "../../context/AuthContext";
import { BookOpen } from "lucide-react";

export default function StudentDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [courses] = useLocalStorage("courses_v1", []);

  const uid = user?._id || user?.id;
  const myCourses = courses.filter((c) =>
    (c.enrolledUserIds || []).includes(uid)
  );

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold">Welcome, {user?.name}!</h2>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold">My Enrolled Courses</h3>
          <button
            onClick={() => onNavigate("courses")}
            className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Browse Courses
          </button>
        </div>

        {myCourses.length === 0 ? (
          <p className="text-gray-500">No courses enrolled yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl shadow overflow-hidden flex flex-col"
              >
                {c.thumbnail ? (
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-500">
                    <BookOpen />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-semibold">{c.title}</h4>
                  <p className="text-sm text-gray-600">{c.platform}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
