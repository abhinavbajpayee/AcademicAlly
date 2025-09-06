// src/components/ai/AITutor.jsx
import React, { useState } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useAuth } from "../../context/AuthContext";

/**
 * Improved & defensive AI Tutor — Career Mode
 * - More robust: guards against undefined arrays to avoid runtime errors.
 * - Same rule-based suggestions as before.
 */

const COURSE_LOOKUP = {
  ml: [
    { title: "Intro to Machine Learning - Coursera", url: "https://www.coursera.org/learn/machine-learning" },
    { title: "Deep Learning Specialization - Coursera", url: "https://www.coursera.org/specializations/deep-learning" },
  ],
  react: [
    { title: "React - The Complete Guide - Udemy", url: "https://www.udemy.com/course/react-the-complete-guide" },
    { title: "Frontend Web Developer - freeCodeCamp", url: "https://www.freecodecamp.org/learn/front-end-libraries/" },
  ],
  web: [
    { title: "Modern Web Dev - MDN / Free resources", url: "https://developer.mozilla.org/en-US/docs/Learn" }
  ],
  dsp: [
    { title: "Digital Signal Processing - Coursera", url: "https://www.coursera.org/learn/dsp" }
  ],
  embedded: [
    { title: "Embedded Systems - Coursera", url: "https://www.coursera.org/specializations/embedded-systems" }
  ],
  ds: [
    { title: "Data Structures & Algorithms - GeeksforGeeks", url: "https://www.geeksforgeeks.org/data-structures/" }
  ]
};

const GITHUB_PROJECTS = {
  ml: ["tensorflow/models", "scikit-learn/scikit-learn", "pytorch/examples"],
  react: ["facebook/react", "vercel/next.js", "tailwindlabs/tailwindcss"],
  web: ["twbs/bootstrap", "axios/axios"],
  dsp: ["xiph/dspfilters"],
  embedded: ["ARMmbed/mbed-os"]
};

const LINKEDIN_GROUPS = {
  ml: ["Machine Learning & AI Professionals", "Data Science Central"],
  react: ["React Developers", "Frontend Developers"],
  web: ["Web Developers", "Full Stack Developers"],
  dsp: ["Signal Processing Group"],
  embedded: ["Embedded Systems Engineers"]
};

const HACKATHON_RESOURCES = [
  { title: "Major League Hacking (MLH)", url: "https://mlh.io" },
  { title: "Devpost hackathons", url: "https://devpost.com/hackathons" }
];

function pickCoursesFromLocal(interestsTags = []) {
  try {
    const local = JSON.parse(localStorage.getItem("courses_v1") || "[]");
    if (!Array.isArray(local) || local.length === 0) return [];
    const picks = [];
    const tags = interestsTags.map(t => t.toLowerCase());
    for (const c of local) {
      const ctags = (c.tags || []).map(t => String(t).toLowerCase());
      if (ctags.some(t => tags.includes(t)) || tags.some(t => (String(c.title || "").toLowerCase().includes(t)))) {
        picks.push({ title: `${c.title} (${c.platform || "course"})`, url: c.url || "#" });
      }
      if (picks.length >= 3) break;
    }
    return picks;
  } catch (e) {
    return [];
  }
}

function generateSuggestions({ branch = "", year = "", interests = "", skillLevel = "beginner", locationPref = "" }) {
  const lowerInterests = (interests || "").toLowerCase();
  const tags = lowerInterests.split(",").map(s => s.trim()).filter(Boolean);

  // build primary interest key (ml, react, web, dsp, embedded, ds)
  const keyScores = {};
  const known = ["ml", "ai", "react", "frontend", "web", "dsp", "embedded", "iot", "data", "ds", "algorithms"];
  for (const t of tags) {
    for (const k of known) {
      if (!t) continue;
      if (t.includes(k) || k.includes(t)) keyScores[k] = (keyScores[k] || 0) + 1;
    }
  }
  // branch hints
  const lowBranch = (branch || "").toLowerCase();
  if (lowBranch.includes("ece")) keyScores.embedded = (keyScores.embedded || 0) + 1;
  if (lowBranch.includes("cse")) { keyScores.ml = (keyScores.ml || 0) + 0.5; keyScores.react = (keyScores.react || 0) + 0.5; }

  const sortedKeys = Object.keys(keyScores).sort((a, b) => (keyScores[b] || 0) - (keyScores[a] || 0));
  const primary = sortedKeys[0] || (tags[0] || "ml");

  // skills mapping
  const skills = [];
  if (["ml", "ai", "data"].includes(primary)) {
    skills.push("Python", "Pandas", "NumPy", "scikit-learn");
    if (skillLevel !== "beginner") skills.push("PyTorch / TensorFlow", "Model Deployment");
  } else if (["react", "frontend", "web"].includes(primary)) {
    skills.push("JavaScript", "React", "HTML/CSS", "REST/APIs");
    if (skillLevel !== "beginner") skills.push("TypeScript", "Next.js");
  } else if (["embedded", "dsp", "iot"].includes(primary)) {
    skills.push("C/C++", "Embedded Linux", "Microcontrollers", "Signal Processing basics");
  } else if (["ds", "algorithms"].includes(primary)) {
    skills.push("Data Structures", "Algorithms", "Complexity analysis", "Competitive programming practice");
  } else {
    skills.push("Programming fundamentals", "Problem solving");
  }

  const localCourses = pickCoursesFromLocal(tags) || [];
  const curated = (COURSE_LOOKUP[primary] || []).slice(0, 3);
  const courseList = [...localCourses, ...curated].slice(0, 4);

  const projects = ((GITHUB_PROJECTS[primary] || []).slice(0, 3)).map(repo => ({
    name: repo,
    url: `https://github.com/${repo}`
  })) || [];

  const projectIdeas = [];
  if (primary === "ml" || primary === "ai") {
    projectIdeas.push("Build an ML model for classification (e.g., sentiment, image) and publish notebook on GitHub.");
    projectIdeas.push("Participate in Kaggle beginner competition and write a short project report.");
  } else if (["react","web"].includes(primary)) {
    projectIdeas.push("Build a full-stack ToDo app with React + simple backend and deploy on Vercel/Netlify.");
    projectIdeas.push("Clone a popular website UI and document components on storybook.");
  } else if (["embedded","dsp"].includes(primary)) {
    projectIdeas.push("Implement a DSP filter on an MCU and log results to a dashboard.");
    projectIdeas.push("Build an IoT sensor prototype and stream data to a small web UI.");
  } else if (["ds","algorithms"].includes(primary)) {
    projectIdeas.push("Solve 100 algorithmic problems on LeetCode and log progress.");
    projectIdeas.push("Implement classic data structures from scratch and publish tests.");
  }

  const groups = (LINKEDIN_GROUPS[primary] || []).slice(0, 3) || [];
  const hackathons = (HACKATHON_RESOURCES || []).slice(0, 5) || [];

  // roadmap
  const roadmap = [];
  if (skillLevel === "beginner") {
    roadmap.push(`Month 1: Finish 1 foundational course (${courseList[0] ? courseList[0].title : "basic programming course"}) and practice basics.`);
    roadmap.push(`Month 2: Implement 1 mini project (see ideas) and push to GitHub.`);
    roadmap.push(`Month 3: Take an intermediate course and start participating in community (LinkedIn groups, GitHub).`);
    roadmap.push(`Month 4: Improve project, make a portfolio page and start applying to small internships/hackathons.`);
    roadmap.push(`Month 5: Target 3 internship applications; prepare resume & LinkedIn.`);
    roadmap.push(`Month 6: Join hackathons and aim for mentorship/real-world contributions.`);
  } else if (skillLevel === "intermediate") {
    roadmap.push(`Month 1: Complete 1 intermediate course and add advanced features to an existing project.`);
    roadmap.push(`Month 2: Publish project with README + demo; start applying to internships.`);
    roadmap.push(`Month 3: Join 1 hackathon or open-source contribution.`);
    roadmap.push(`Month 4: Build a capstone project and document outcomes.`);
    roadmap.push(`Month 5: Apply to targeted internships / research positions.`);
    roadmap.push(`Month 6: Network on LinkedIn; ask mentors for referrals.`);
  } else {
    roadmap.push(`Month 1: Polish portfolio and complete an advanced specialization.`);
    roadmap.push(`Month 2: Contribute to open-source and lead a small project.`);
    roadmap.push(`Month 3: Target internships at preferred companies; prepare system design / interviews.`);
    roadmap.push(`Month 4: Take leadership in a project or research.`);
    roadmap.push(`Month 5: Apply to internships and seek mentor referrals.`);
    roadmap.push(`Month 6: Interview preparation and finalize offers.`);
  }

  return {
    primaryInterest: primary,
    skills: skills || [],
    courses: Array.isArray(courseList) ? courseList : [],
    projects: Array.isArray(projects) ? projects : [],
    projectIdeas: Array.isArray(projectIdeas) ? projectIdeas : [],
    groups: Array.isArray(groups) ? groups : [],
    hackathons: Array.isArray(hackathons) ? hackathons : [],
    roadmap: Array.isArray(roadmap) ? roadmap : []
  };
}

export default function AITutor({ onNavigate }) {
  const { user } = useAuth();
  const uid = user?._id || user?.id || "anon";

  const [profile] = useLocalStorage(`profile_${uid}`, {});
  const [branch, setBranch] = useState(profile.branch || "");
  const [year, setYear] = useState(profile.year || "");
  const [interests, setInterests] = useState(profile.interests || "");
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [locationPref, setLocationPref] = useState(profile.location || "");
  const [result, setResult] = useState(null);

  const runCareerMode = () => {
    const inputs = { branch, year, interests, skillLevel, locationPref };
    const out = generateSuggestions(inputs);

    // persist logs for analytics
    const logsKey = `career_logs_${uid}`;
    const logs = JSON.parse(localStorage.getItem(logsKey) || "[]");
    logs.unshift({ id: Date.now().toString(), timestamp: Date.now(), inputs, result: out });
    localStorage.setItem(logsKey, JSON.stringify(logs));

    setResult({ inputs, out, generatedAt: Date.now() });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">AI Tutor — Career Mode</h2>

      <div className="bg-white p-4 rounded shadow grid md:grid-cols-2 gap-3">
        <input placeholder="Branch (CSE, ECE...)" value={branch} onChange={e => setBranch(e.target.value)} className="px-3 py-2 border rounded" />
        <input placeholder="Year (e.g., 2nd Year)" value={year} onChange={e => setYear(e.target.value)} className="px-3 py-2 border rounded" />
        <input placeholder="Interests (comma separated, e.g., ML, React)" value={interests} onChange={e => setInterests(e.target.value)} className="px-3 py-2 border rounded md:col-span-2" />
        <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)} className="px-3 py-2 border rounded">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <input placeholder="Location preference (city/remote)" value={locationPref} onChange={e => setLocationPref(e.target.value)} className="px-3 py-2 border rounded" />
        <div className="md:col-span-2 flex gap-2">
          <button onClick={runCareerMode} className="px-4 py-2 bg-indigo-600 text-white rounded">Get Career Roadmap</button>
          <button onClick={() => onNavigate && onNavigate("career-advisor")} className="px-4 py-2 border rounded">Open Career Advisor</button>
        </div>
      </div>

      {result && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Personalized Roadmap</h3>

          <div className="mt-3">
            <div className="text-sm font-medium">Primary focus</div>
            <div className="mt-1">{result?.out?.primaryInterest || "—"}</div>

            <div className="text-sm font-medium mt-3">Skills to learn</div>
            <div className="mt-1">{(result?.out?.skills || []).join(", ") || "—"}</div>

            <div className="text-sm font-medium mt-3">Roadmap (6 months)</div>
            <ol className="list-decimal list-inside ml-4 mt-1">
              {(result?.out?.roadmap || []).map((r, i) => <li key={i} className="mt-1">{r}</li>)}
            </ol>

            <div className="text-sm font-medium mt-3">Courses & Resources</div>
            <ul className="list-disc list-inside ml-4 mt-1">
              {(result?.out?.courses || []).map((c, i) => (
                <li key={i}><a href={c.url || "#"} target="_blank" rel="noreferrer" className="text-indigo-600">{c.title}</a></li>
              ))}
            </ul>

            <div className="text-sm font-medium mt-3">Project ideas & repos</div>
            <ul className="list-disc list-inside ml-4 mt-1">
              {(result?.out?.projectIdeas || []).map((p, i) => <li key={`pi${i}`}>{p}</li>)}
              {(result?.out?.projects || []).map((g, i) => <li key={`g${i}`}><a href={g.url} target="_blank" rel="noreferrer" className="text-indigo-600">{g.name}</a></li>)}
            </ul>

            <div className="text-sm font-medium mt-3">LinkedIn groups</div>
            <ul className="list-disc list-inside ml-4 mt-1">
              {(result?.out?.groups || []).map((g, i) => <li key={`lg${i}`}>{g}</li>)}
            </ul>

            <div className="text-sm font-medium mt-3">Hackathons & events</div>
            <ul className="list-disc list-inside ml-4 mt-1">
              {(result?.out?.hackathons || []).map((h, i) => <li key={`h${i}`}><a href={h.url} target="_blank" rel="noreferrer" className="text-indigo-600">{h.title}</a></li>)}
            </ul>

            <div className="mt-3 text-xs text-gray-500">Generated at: {new Date(result?.generatedAt || Date.now()).toLocaleString()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
