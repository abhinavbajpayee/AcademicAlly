import { useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useLocalStorage from "../../hooks/useLocalStorage";
import { Camera, Pencil, Save, X, Plus, Link2 } from "lucide-react";

const emptyProfile = (user) => ({
  name: user?.name || "",
  headline: "Student | Lifelong Learner",
  bio: "",
  photo: "",           // dataURL
  links: {
    linkedin: "",
    github: "",
    portfolio: "",
  },
  skills: ["React", "Tailwind"],
});

export default function ProfilePage() {
  const { user } = useAuth();
  const storageKey = `aa_profile_${user?.id || user?._id || "guest"}`;
  const [profile, setProfile] = useLocalStorage(storageKey, emptyProfile(user));
  const [edit, setEdit] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const fileRef = useRef(null);

  const update = (patch) => setProfile((p) => ({ ...p, ...patch }));

  const onPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => update({ photo: reader.result });
    reader.readAsDataURL(f);
  };

  const addSkill = () => {
    const v = skillInput.trim();
    if (!v) return;
    if (profile.skills.includes(v)) return setSkillInput("");
    update({ skills: [...profile.skills, v] });
    setSkillInput("");
  };

  const removeSkill = (s) =>
    update({ skills: profile.skills.filter((x) => x !== s) });

  const save = () => {
    setEdit(false); // state already persisted via hook
  };

  const reset = () => setProfile(emptyProfile(user));

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6 bg-white rounded-xl shadow p-6">
        <div className="relative">
          <img
            src={profile.photo || "https://i.pravatar.cc/160?img=13"}
            alt="profile"
            className="w-32 h-32 rounded-full object-cover ring-4 ring-indigo-100"
          />
          {edit && (
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full shadow hover:bg-indigo-700"
              type="button"
              title="Change photo"
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

        <div className="flex-1">
          {edit ? (
            <div className="grid gap-3">
              <input
                className="px-3 py-2 border rounded-lg"
                value={profile.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="Your name"
              />
              <input
                className="px-3 py-2 border rounded-lg"
                value={profile.headline}
                onChange={(e) => update({ headline: e.target.value })}
                placeholder="Headline (e.g., CSE @ IITK)"
              />
              <textarea
                className="px-3 py-2 border rounded-lg min-h-[100px]"
                value={profile.bio}
                onChange={(e) => update({ bio: e.target.value })}
                placeholder="Bio"
              />
              <div className="grid md:grid-cols-3 gap-3">
                <input
                  className="px-3 py-2 border rounded-lg"
                  value={profile.links.linkedin}
                  onChange={(e) =>
                    update({ links: { ...profile.links, linkedin: e.target.value } })
                  }
                  placeholder="LinkedIn URL"
                />
                <input
                  className="px-3 py-2 border rounded-lg"
                  value={profile.links.github}
                  onChange={(e) =>
                    update({ links: { ...profile.links, github: e.target.value } })
                  }
                  placeholder="GitHub URL"
                />
                <input
                  className="px-3 py-2 border rounded-lg"
                  value={profile.links.portfolio}
                  onChange={(e) =>
                    update({ links: { ...profile.links, portfolio: e.target.value } })
                  }
                  placeholder="Portfolio URL"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Skills</p>
                <div className="flex gap-2 mb-2">
                  <input
                    className="px-3 py-2 border rounded-lg flex-1"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => (e.key === "Enter" ? addSkill() : null)}
                    placeholder="Add a skill and press Enter"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full flex items-center gap-2"
                    >
                      {s}
                      <button
                        className="text-indigo-700/70 hover:text-indigo-900"
                        onClick={() => removeSkill(s)}
                        type="button"
                        title="Remove"
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
              <h2 className="text-3xl font-bold">{profile.name || "Your Name"}</h2>
              <p className="text-gray-600">{profile.headline}</p>
              <p className="mt-3 text-gray-700 leading-relaxed">{profile.bio || "Add a short bio…"}</p>

              <div className="flex flex-wrap gap-3 mt-4">
                {Object.entries(profile.links)
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

              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}

          <div className="mt-6 flex gap-3">
            {edit ? (
              <>
                <button
                  onClick={save}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Save size={18} /> Save
                </button>
                <button
                  onClick={() => setEdit(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  Reset
                </button>
              </>
            ) : (
              <button
                onClick={() => setEdit(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
              >
                <Pencil size={18} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
