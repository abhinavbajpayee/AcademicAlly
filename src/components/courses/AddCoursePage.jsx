import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useLocalStorage from "../../hooks/useLocalStorage";
import { Plus } from "lucide-react";

const makeCourse = (owner) => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  platform: "Udemy",
  url: "",
  thumbnail: "",
  tags: [],
  advice: "Share tips or weekly plan here.",
  teacherId: owner?.id || owner?._id || "teacher",
  teacherName: owner?.name || owner?.username || "Instructor",
  createdAt: Date.now(),
  enrolledUserIds: [],
  comments: [],
});

export default function AddCoursePage({ onNavigate }) {
  const { user } = useAuth();
  const [courses, setCourses] = useLocalStorage("courses_v1", []);
  const [course, setCourse] = useState(() => makeCourse(user));
  const [tagsText, setTagsText] = useState("");

  const save = (e) => {
    e.preventDefault();
    if (!course.title.trim() || !course.url.trim() || !course.description.trim()) return;
    const tags = tagsText.split(",").map(t => t.trim()).filter(Boolean);
    const payload = { ...course, tags };
    setCourses([payload, ...courses]);
    onNavigate("courses");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Add a Course</h2>
      <form onSubmit={save} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input className="px-3 py-2 border rounded-lg" placeholder="Course Title"
                 value={course.title} onChange={e=>setCourse({...course, title:e.target.value})} />
          <select className="px-3 py-2 border rounded-lg" value={course.platform}
                  onChange={e=>setCourse({...course, platform:e.target.value})}>
            <option>Udemy</option><option>Coursera</option><option>YouTube</option><option>Custom</option>
          </select>
        </div>
        <textarea className="w-full px-3 py-2 border rounded-lg min-h-[110px]" placeholder="Description"
                  value={course.description} onChange={e=>setCourse({...course, description:e.target.value})}/>
        <input className="w-full px-3 py-2 border rounded-lg" placeholder="Course URL"
               value={course.url} onChange={e=>setCourse({...course, url:e.target.value})}/>
        <input className="w-full px-3 py-2 border rounded-lg" placeholder="Thumbnail URL (optional)"
               value={course.thumbnail} onChange={e=>setCourse({...course, thumbnail:e.target.value})}/>
        <input className="w-full px-3 py-2 border rounded-lg" placeholder="Tags (comma separated)"
               value={tagsText} onChange={e=>setTagsText(e.target.value)}/>
        <textarea className="w-full px-3 py-2 border rounded-lg" placeholder="Teacher Advice"
                  value={course.advice} onChange={e=>setCourse({...course, advice:e.target.value})}/>
        <div className="flex gap-2">
          <button type="submit" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            <Plus size={18}/> Add Course
          </button>
          <button type="button" onClick={()=>onNavigate("courses")} className="px-4 py-2 rounded-lg border">Cancel</button>
        </div>
      </form>
    </div>
  );
}
