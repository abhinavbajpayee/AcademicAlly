// src/components/career/CareerAnalytics.jsx
import React from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useAuth } from "../../context/AuthContext";

export default function CareerAnalytics() {
  const { user } = useAuth();
  const uid = user?._id || user?.id || "anon";

  const [profile] = useLocalStorage(`profile_${uid}`, {});
  const logs = JSON.parse(localStorage.getItem(`career_logs_${uid}`) || "[]");
  const courses = JSON.parse(localStorage.getItem("courses_v1") || "[]");

  const coursesCompleted = (profile.completedCourses || []).length;
  const skillsAcquired = (profile.skills || []).length;
  const recommendations = logs.length;
  const totalCourses = courses.length;
  const completionRate =
    totalCourses > 0 ? Math.round((coursesCompleted / totalCourses) * 100) : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Career Analytics</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Courses Completed</div>
          <div className="text-2xl font-bold">{coursesCompleted}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Courses</div>
          <div className="text-2xl font-bold">{totalCourses}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Skills Acquired</div>
          <div className="text-2xl font-bold">{skillsAcquired}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Completion Rate</div>
          <div className="text-2xl font-bold">{completionRate}%</div>
        </div>
      </div>

      {/* Career Suggestions */}
      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold">Career Suggestions Generated</h4>
        <p className="text-xl font-bold">{recommendations}</p>
      </div>

      {/* Recent Logs */}
      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold">Recent Career Interactions</h4>
        {logs.length === 0 ? (
          <p className="text-gray-500">No recommendations yet</p>
        ) : (
          <ul className="mt-2">
            {logs.slice(0, 10).map((l) => (
              <li key={l.id} className="py-2 border-b">
                <div className="text-sm text-gray-600">
                  {new Date(l.timestamp).toLocaleString()}
                </div>
                <div className="text-sm">
                  Interests: {l.inputs.interests || "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Skills suggested:{" "}
                  {(l.result?.skills || []).slice(0, 4).join(", ")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
