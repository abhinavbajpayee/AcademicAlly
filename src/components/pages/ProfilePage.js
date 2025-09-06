// src/components/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useAuth } from "../../context/AuthContext";

const COMMON_SKILLS = ["Python", "React", "Machine Learning", "Data Structures", "SQL", "JavaScript", "C++"];

export default function ProfilePage() {
  const { user } = useAuth();
  const uid = user?._id || user?.id || "anon";

  const [profile, setProfile] = useLocalStorage(`profile_${uid}`, {
    name: user?.name || "",
    bio: "",
    skills: [],
    linkedin: "",
    projects: [],
    branch: "",
    year: "",
    interests: "",
    location: ""
  });

  const [skillInput, setSkillInput] = useState("");
  const [linkedInText, setLinkedInText] = useState("");

  useEffect(() => {
    // initialize LinkedIn text preview
    setLinkedInText(generateLinkedIn());
    // eslint-disable-next-line
  }, []);

  const addSkill = (s) => {
    const v = (s || skillInput || "").trim();
    if (!v) return;
    if ((profile.skills || []).some(x => x.toLowerCase() === v.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setProfile(p => ({ ...p, skills: [...(p.skills || []), v] }));
    setSkillInput("");
  };

  const removeSkill = (s) => {
    setProfile(p => ({ ...p, skills: (p.skills || []).filter(x => x !== s) }));
  };

  const toggleCommonSkill = (s) => {
    const has = (profile.skills || []).includes(s);
    if (has) removeSkill(s);
    else addSkill(s);
  };

  const generateResumeText = () => {
    const p = profile || {};
    const skills = (p.skills || []).join(", ");
    const projects = (Array.isArray(p.projects) ? p.projects : (p.projects || [])).join("; ");
    return `Name: ${p.name}
Branch/Year: ${p.branch} ${p.year}
Bio: ${p.bio}
Interests: ${p.interests || ""}
Skills: ${skills}
Projects: ${projects}
LinkedIn: ${p.linkedin || ""}`;
  };

  const downloadResume = () => {
    const txt = generateResumeText();
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (profile.name || "profile").replace(/\s+/g, "_");
    a.href = url;
    a.download = `${safeName}.txt`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateLinkedIn = () => {
    const p = profile || {};
    const skills = (p.skills || []).join(", ");
    const projects = (Array.isArray(p.projects) ? p.projects : (p.projects || [])).join("; ");
    return `Hi, I'm ${p.name || ""}, a ${p.year || ""} ${p.branch || ""} student interested in ${p.interests || ""}. Skilled in ${skills}. I've worked on: ${projects}. I'm looking for internship opportunities in ${p.location || "India"}.`;
  };

  const onProjectsChange = (val) => {
    // accept comma-separated input and store as array
    const arr = String(val || "").split(",").map(x => x.trim()).filter(Boolean);
    setProfile(p => ({ ...p, projects: arr }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Profile</h2>

      <div className="bg-white p-4 rounded shadow">
        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="px-3 py-2 border rounded"
            value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            placeholder="Full name"
          />
          <input
            className="px-3 py-2 border rounded"
            value={profile.branch}
            onChange={e => setProfile(p => ({ ...p, branch: e.target.value }))}
            placeholder="Branch (e.g., CSE)"
          />
          <input
            className="px-3 py-2 border rounded"
            value={profile.year}
            onChange={e => setProfile(p => ({ ...p, year: e.target.value }))}
            placeholder="Year (e.g., 2nd Year)"
          />
          <input
            className="px-3 py-2 border rounded"
            value={profile.linkedin}
            onChange={e => setProfile(p => ({ ...p, linkedin: e.target.value }))}
            placeholder="LinkedIn URL"
          />
        </div>

        <textarea
          className="w-full mt-3 px-3 py-2 border rounded"
          value={profile.bio}
          onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
          placeholder="Short bio"
        />

        <div className="mt-3">
          <label className="text-sm text-gray-600">Interests (comma separated)</label>
          <input
            className="w-full px-3 py-2 border rounded mt-1"
            value={profile.interests || ""}
            onChange={e => setProfile(p => ({ ...p, interests: e.target.value }))}
            placeholder="AI, ML, Web Development..."
          />
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">Select common skills</div>
          <div className="flex gap-2 flex-wrap">
            {COMMON_SKILLS.map(s => {
              const active = (profile.skills || []).includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleCommonSkill(s)}
                  className={`px-3 py-1 rounded ${active ? "bg-indigo-600 text-white" : "bg-gray-100"}`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              className="px-3 py-2 border rounded flex-1"
              placeholder="Add custom skill (press Enter or Add)"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
            />
            <button type="button" onClick={() => addSkill()} className="px-3 py-2 bg-indigo-600 text-white rounded">Add</button>
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {(profile.skills || []).map(s => (
              <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded inline-flex items-center gap-2">
                <span>{s}</span>
                <button type="button" onClick={() => removeSkill(s)} className="ml-2 text-sm text-indigo-900">x</button>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm text-gray-600">Projects (comma separated)</label>
          <input
            className="w-full px-3 py-2 border rounded mt-1"
            value={(profile.projects || []).join(", ")}
            onChange={e => onProjectsChange(e.target.value)}
            placeholder="Project1, Project2"
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={downloadResume} className="px-3 py-2 bg-gray-900 text-white rounded">Export Resume</button>
          <button type="button" onClick={() => setLinkedInText(generateLinkedIn())} className="px-3 py-2 bg-indigo-600 text-white rounded">Generate LinkedIn Text</button>
        </div>

        <div className="mt-3">
          <label className="text-sm text-gray-600">LinkedIn / Profile Draft</label>
          <textarea
            className="w-full mt-2 px-3 py-2 border rounded"
            value={linkedInText}
            onChange={e => setLinkedInText(e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
