import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useLocalStorage from "../../hooks/useLocalStorage";
import { Plus, Trash2, Check, X, Globe, Lock, Megaphone, Send } from "lucide-react"; 
// ✅ Removed unused "Users" import

const newClass = (ownerId) => ({
  id: crypto.randomUUID(),
  name: "",
  subject: "",
  desc: "",
  private: false,
  ownerId,
  pending: [],  // student ids awaiting approval
  students: [], // approved ids
  announcements: [], // {id, text, createdAt}
  createdAt: Date.now(),
});

export default function TeacherClassesPage() {
  const { user } = useAuth();
  const tid = user?.id || user?._id || "teacher";
  const [classes, setClasses] = useLocalStorage(`t_classes_${tid}`, []);
  const [filter, setFilter] = useState("");
  const [draft, setDraft] = useState(() => newClass(tid));
  const [announceText, setAnnounceText] = useState("");

  const myClasses = useMemo(
    () => classes.filter((c) => c.ownerId === tid),
    [classes, tid]
  );

  const createClass = () => {
    if (!draft.name.trim() || !draft.subject.trim()) return;
    setClasses([draft, ...classes]);
    setDraft(newClass(tid));
  };

  const removeClass = (id) => setClasses((l) => l.filter((c) => c.id !== id));

  const approve = (cid, sid) =>
    setClasses((list) =>
      list.map((c) =>
        c.id !== cid
          ? c
          : {
              ...c,
              pending: c.pending.filter((x) => x !== sid),
              students: [...new Set([...c.students, sid])],
            }
      )
    );

  const reject = (cid, sid) =>
    setClasses((list) =>
      list.map((c) =>
        c.id !== cid ? c : { ...c, pending: c.pending.filter((x) => x !== sid) }
      )
    );

  const addAnnouncement = (cid) => {
    if (!announceText.trim()) return;
    setClasses((list) =>
      list.map((c) =>
        c.id !== cid
          ? c
          : {
              ...c,
              announcements: [
                { id: crypto.randomUUID(), text: announceText, createdAt: Date.now() },
                ...c.announcements,
              ],
            }
      )
    );
    setAnnounceText("");
  };

  // demo: simulate a "join request"
  const simulateJoinRequest = (cid) =>
    setClasses((list) =>
      list.map((c) =>
        c.id !== cid ? c : { ...c, pending: [...new Set([...c.pending, "demo_student"])] }
      )
    );

  const filtered = myClasses.filter((c) => {
    const q = filter.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Create */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Create Class / Room</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="px-3 py-2 border rounded-lg"
            placeholder="Class Name (e.g. DSA Cohort)"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDraft({ ...draft, private: !draft.private })}
              className="px-3 py-2 rounded-lg border flex items-center gap-2"
              type="button"
            >
              {draft.private ? <Lock size={16} /> : <Globe size={16} />}
              {draft.private ? "Private" : "Public"}
            </button>
          </div>
          <input
            className="px-3 py-2 border rounded-lg"
            placeholder="Subject (e.g. Data Structures)"
            value={draft.subject}
            onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
          />
          <textarea
            className="px-3 py-2 border rounded-lg md:col-span-2"
            placeholder="Description"
            value={draft.desc}
            onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
          />
        </div>
        <div className="mt-4">
          <button
            onClick={createClass}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
          >
            <Plus size={18} /> Create
          </button>
        </div>
      </div>

      {/* Manage */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold">Your Classes</h3>
          <input
            className="px-3 py-2 border rounded-lg w-64"
            placeholder="Search classes"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-500">No classes yet. Create one above.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((c) => (
              <div key={c.id} className="border rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold">{c.name}</h4>
                    <p className="text-sm text-gray-600">{c.subject}</p>
                    <p className="text-sm text-gray-600 mt-1">{c.desc}</p>
                  </div>
                  <button
                    onClick={() => removeClass(c.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete class"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Students & pending */}
                <div className="mt-3">
                  <p className="text-sm font-medium">Students ({c.students.length})</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {c.students.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                        {s}
                      </span>
                    ))}
                    {c.students.length === 0 && (
                      <span className="text-xs text-gray-500">No students yet.</span>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium">Pending Requests ({c.pending.length})</p>
                  <div className="space-y-2 mt-1">
                    {c.pending.map((s) => (
                      <div key={s} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                        <span className="text-sm">{s}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approve(c.id, s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={() => reject(c.id, s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 text-xs"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                    {c.pending.length === 0 && (
                      <div className="text-xs text-gray-500">No pending joins.</div>
                    )}
                  </div>

                  {/* Demo button to simulate a request */}
                  <button
                    onClick={() => simulateJoinRequest(c.id)}
                    className="mt-2 text-xs text-indigo-600 hover:underline"
                  >
                    Simulate join request
                  </button>
                </div>

                {/* Announcements */}
                <div className="mt-4 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Megaphone size={16} className="text-gray-600" />
                    <p className="text-sm font-medium">Announcements</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      className="flex-1 px-3 py-2 border rounded-lg"
                      placeholder="Write an announcement"
                      value={announceText}
                      onChange={(e) => setAnnounceText(e.target.value)}
                    />
                    <button
                      onClick={() => addAnnouncement(c.id)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <Send size={16} /> Post
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {c.announcements.map((a) => (
                      <div key={a.id} className="p-2 bg-gray-50 rounded-lg text-sm">
                        {a.text}
                        <div className="text-[10px] text-gray-500">
                          {new Date(a.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {c.announcements.length === 0 && (
                      <p className="text-xs text-gray-500">No announcements yet.</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-gray-100">
                    {c.private ? "Private" : "Public"}
                  </span>
                  <span className="text-gray-500">
                    Created {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
