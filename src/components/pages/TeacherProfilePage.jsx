import { useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useLocalStorage from "../../hooks/useLocalStorage";
import { Camera, Save, X, Plus, Link2 } from "lucide-react";

// default structure
const empty = (user) => ({
  name: user?.name || "",
  photo: "",
  headline: "Faculty | Mentor",
  bio: "",
  subjects: ["DSA", "AI"],
  experience: "3+ years teaching UG/PG students.",
  links: { linkedin: "", scholar: "", website: "" },
});

export default function TeacherProfilePage() {
  const { user } = useAuth();
  const key = `t_profile_${user?.id || user?._id || "teacher"}`;
  const [p, setP] = useLocalStorage(key, empty(user));
  const [edit, setEdit] = useState(false); // default view mode
  const [subject, setSubject] = useState("");
  const fileRef = useRef(null);

  const update = (patch) => setP((s) => ({ ...s, ...patch }));

  const onPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => update({ photo: reader.result });
    reader.readAsDataURL(f);
  };

  const addSubject = () => {
    const v = subject.trim();
    if (!v) return;
    if (p.subjects.includes(v)) return setSubject("");
    update({ subjects: [...p.subjects, v] });
    setSubject("");
  };

  const removeSubject = (s) =>
    update({ subjects: p.subjects.filter((x) => x !== s) });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6 flex gap-6">
        {/* Profile Image */}
        <div className="relative">
          <img
            src={
              p.photo ||
              "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(p.name || "Teacher")
            }
            alt="Teacher Profile"
            className="w-32 h-32 rounded-full object-cover"
          />

          {edit && (
            <button
              className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full"
              onClick={() => fileRef.current?.click()}
            >
              <Camera size={18} />
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onPhoto}
          />
        </div>

        {/* Profile Details */}
        <div className="flex-1">
          {edit ? (
            <div className="grid gap-3">
              <input
                className="px-3 py-2 border rounded-lg"
                value={p.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Name"
              />
              <input
                className="px-3 py-2 border rounded-lg"
                value={p.headline}
                onChange={(e) => update({ headline: e.target.value })}
                placeholder="Headline"
              />
              <textarea
                className="px-3 py-2 border rounded-lg min-h-[100px]"
                value={p.bio}
                onChange={(e) => update({ bio: e.target.value })}
                placeholder="Bio"
              />
              <textarea
                className="px-3 py-2 border rounded-lg"
                value={p.experience}
                onChange={(e) => update({ experience: e.target.value })}
                placeholder="Experience"
              />

              {/* Links */}
              <div className="grid md:grid-cols-3 gap-3">
                {["linkedin", "scholar", "website"].map((k) => (
                  <input
                    key={k}
                    className="px-3 py-2 border rounded-lg"
                    value={p.links[k]}
                    onChange={(e) =>
                      update({ links: { ...p.links, [k]: e.target.value } })
                    }
                    placeholder={`${k[0].toUpperCase() + k.slice(1)} URL`}
                  />
                ))}
              </div>

              {/* Subjects */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Subjects
                </p>
                <div className="flex gap-2 mb-2">
                  <input
                    className="px-3 py-2 border rounded-lg flex-1"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onKeyDown={(e) => (e.key === "Enter" ? addSubject() : null)}
                    placeholder="Add subject and press Enter"
                  />
                  <button
                    onClick={addSubject}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    type="button"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.subjects.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full flex items-center gap-1"
                    >
                      {s}
                      <button
                        className="text-indigo-700/70"
                        onClick={() => removeSubject(s)}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold">{p.name}</h2>
              <p className="text-gray-600">{p.headline}</p>
              <p className="mt-3">{p.bio}</p>
              <p className="mt-2 text-sm text-gray-600">{p.experience}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                {Object.entries(p.links)
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <a
                      key={k}
                      href={v}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                      <Link2 size={16} /> {k}
                    </a>
                  ))}
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                {p.subjects.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}

          <div className="mt-6 flex gap-3">
            {edit ? (
              <button
                onClick={() => setEdit(false)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Save size={18} /> Save
              </button>
            ) : (
              <button
                onClick={() => setEdit(true)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
