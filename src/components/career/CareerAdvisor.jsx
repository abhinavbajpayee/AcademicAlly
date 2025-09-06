import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import useLocalStorage from "../../hooks/useLocalStorage";

/**
 * Lightweight career advisor (rule-based).
 * For production: replace with real AI API.
 */

export default function CareerAdvisor({ onNavigate }) {
  const { user } = useAuth();
  const uid = user?._id || user?.id || "anon";

  const [profile, setProfile] = useLocalStorage(`profile_${uid}`, {
    name: user?.name || "",
    year: "",
    branch: "",
    interests: "",
    skills: [],
    summary: ""
  });

  const [courses] = useLocalStorage("courses_v1", []);
  const [inputInterests, setInputInterests] = useState(profile.interests || "");
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState(profile.skills || []);
  const [result, setResult] = useState(null);

  // keep local selectedSkills in sync with stored profile on mount/changes
  useEffect(() => {
    setSelectedSkills(profile.skills || []);
  }, [profile.skills]);

  // persist interests whenever inputInterests changes (optional)
  useEffect(() => {
    setProfile(p => ({ ...p, interests: inputInterests }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputInterests]);

  const recommend = () => {
    const q = (inputInterests || profile.interests || "")
      .toLowerCase()
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const skillset = new Set(selectedSkills.map(s => s.toLowerCase()));

    const scored = (courses || [])
      .map(c => {
        let score = 0;
        const tags = (c.tags || []).map(t => t.toLowerCase());
        q.forEach(qi => {
          if (tags.includes(qi)) score += 3;
          if ((c.title || "").toLowerCase().includes(qi)) score += 2;
        });
        tags.forEach(t => {
          if (skillset.has(t)) score += 2;
        });
        return { course: c, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);

    const roadmap = [
      "Start with 1 foundational course from above recommendations.",
      "Build 1 small project that uses the core concepts.",
      "Apply to internships / mentorship rooms and document work in profile."
    ];

    setResult({ scored, roadmap });

    // persist profile interests & skills
    setProfile(s => ({ ...s, interests: inputInterests, skills: selectedSkills }));
  };

  const addSkill = (s) => {
    const v = (s || "").trim();
    if (!v) return;
    // avoid duplicates (case-insensitive)
    const lower = v.toLowerCase();
    if (selectedSkills.some(x => x.toLowerCase() === lower)) return;
    const next = [...selectedSkills, v];
    setSelectedSkills(next);
    setProfile(p => ({ ...p, skills: next }));
    setSkillInput("");
  };

  const removeSkill = (s) => {
    const next = selectedSkills.filter(x => x !== s);
    setSelectedSkills(next);
    setProfile(p => ({ ...p, skills: next }));
  };

  const generateResumeText = () => {
    const p = profile || {};
    const skills = (p.skills || []).join(", ");
    const topCourses =
      result && result.scored && result.scored.length
        ? result.scored.slice(0, 3).map(x => x.course.title).join("; ")
        : "";
    return `Name: ${p.name}
Branch/Year: ${p.branch} ${p.year}
Summary: ${p.summary}
Skills: ${skills}
Recommended Courses: ${topCourses}`;
  };

  const downloadResume = () => {
    const txt = generateResumeText();
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (profile.name || "resume").replace(/\s+/g, "_");
    a.href = url;
    a.download = `${safeName}.txt`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Career Advisor</h2>

      <div className="bg-white rounded-xl p-4 shadow">
        <div className="grid md:grid-cols-2 gap-3">
          <input
            value={profile.name}
            onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            placeholder="Full name"
            className="px-3 py-2 border rounded"
          />
          <input
            value={profile.branch}
            onChange={e => setProfile(p => ({ ...p, branch: e.target.value }))}
            placeholder="Branch (e.g., CSE)"
            className="px-3 py-2 border rounded"
          />
          <input
            value={profile.year}
            onChange={e => setProfile(p => ({ ...p, year: e.target.value }))}
            placeholder="Year (e.g., 2nd Year)"
            className="px-3 py-2 border rounded"
          />
          <input
            value={profile.summary}
            onChange={e => setProfile(p => ({ ...p, summary: e.target.value }))}
            placeholder="Short summary / objective"
            className="px-3 py-2 border rounded"
          />
        </div>

        <div className="mt-3">
          <label className="text-sm text-gray-600">Interests (comma separated)</label>
          <input
            className="w-full px-3 py-2 border rounded"
            value={inputInterests}
            onChange={e => setInputInterests(e.target.value)}
          />
        </div>

        <div className="mt-3">
          <label className="text-sm text-gray-600">Skills (type & press Add)</label>
          <div className="flex gap-2 items-center">
            <input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
              className="px-3 py-2 border rounded flex-1"
              placeholder="e.g., python, ml, react"
            />
            <button
              type="button"
              onClick={() => addSkill(skillInput)}
              className="px-3 py-2 bg-indigo-600 text-white rounded"
            >
              Add
            </button>
          </div>

          <div className="flex gap-2 mt-2 flex-wrap">
            {selectedSkills.map(s => (
              <span key={s} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded inline-flex items-center gap-2">
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="text-xs text-indigo-900 ml-1"
                  aria-label={`Remove ${s}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={recommend}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Get Recommendations
          </button>
          <button
            type="button"
            onClick={downloadResume}
            className="px-4 py-2 bg-gray-900 text-white rounded"
          >
            Download Resume
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold">Recommended Courses</h3>
          {(!result.scored || result.scored.length === 0) ? (
            <p className="text-gray-500">No direct matches found. Explore courses manually.</p>
          ) : (
            <div className="grid gap-2 mt-2">
              {result.scored.map(({ course, score }) => (
                <div key={course.id} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{course.title}</div>
                    <div className="text-xs text-gray-500">{course.platform} • {course.teacherName}</div>
                  </div>
                  <div className="text-sm text-gray-600">score: {score}</div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3">
            <h4 className="font-semibold">Roadmap</h4>
            <ol className="list-decimal list-inside ml-4 text-sm">
              {result.roadmap.map((r, i) => <li key={i} className="mt-1">{r}</li>)}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
