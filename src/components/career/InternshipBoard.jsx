// src/components/career/InternshipBoard.jsx
import React, { useState } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useAuth } from "../../context/AuthContext";

/**
 * InternshipBoard (improved)
 * - teacher-only posting
 * - type: internship | hackathon | research
 * - filter by type
 * - apply / show applied state
 * - delete by author (or teacher)
 */

export default function InternshipBoard() {
  const { user } = useAuth();
  const uid = user?._id || user?.id || "anon";

  const [posts, setPosts] = useLocalStorage("internships_v1", []);
  const [form, setForm] = useState({ title: "", org: "", desc: "", applyLink: "", type: "internship" });
  const [filterType, setFilterType] = useState("all");

  const makeId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  };

  const create = () => {
    if (!form.title.trim()) return alert("Title required");
    if (!form.org.trim()) return alert("Organization required");
    // posting restricted: prefer teacher-only, but allow if you want remove this guard
    if (!user) return alert("Please login to post an opportunity");
    if (user.role !== "teacher") {
      if (!window.confirm("You are not a teacher. Post anyway as a community post?")) {
        return;
      }
    }

    const p = {
      id: makeId(),
      ...form,
      createdAt: Date.now(),
      postedBy: user?.name || "anon",
      postedById: uid,
      applicants: []
    };

    setPosts(prev => [p, ...prev]);
    setForm({ title: "", org: "", desc: "", applyLink: "", type: "internship" });
  };

  const apply = (id) => {
    if (!user) return alert("Please login to apply");
    setPosts(prev =>
      prev.map(x =>
        x.id === id
          ? {
              ...x,
              applicants: Array.from(new Set([...(x.applicants || []), uid]))
            }
          : x
      )
    );
  };

  const hasApplied = (post) => {
    return (post.applicants || []).includes(uid);
  };

  const removePost = (id) => {
    if (!user) return alert("Login required");
    const post = posts.find(p => p.id === id);
    if (!post) return;
    // only author or teacher can delete
    if (post.postedById !== uid && user.role !== "teacher") return alert("Only the author or a teacher can delete this post");
    if (!window.confirm("Delete this post?")) return;
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const filtered = posts.filter(p => filterType === "all" ? true : (p.type === filterType));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Opportunities & Internships</h2>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Post an Opportunity</h3>
        <div className="text-sm text-gray-500 mb-2">Teachers / Institutions preferred for official posts.</div>

        <div className="grid md:grid-cols-2 gap-2 mt-2">
          <input
            className="px-3 py-2 border rounded"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <input
            className="px-3 py-2 border rounded"
            placeholder="Organization"
            value={form.org}
            onChange={e => setForm(f => ({ ...f, org: e.target.value }))}
          />

          <select
            className="px-3 py-2 border rounded md:col-span-2"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          >
            <option value="internship">Internship</option>
            <option value="hackathon">Hackathon</option>
            <option value="research">Research</option>
            <option value="other">Other</option>
          </select>

          <input
            className="px-3 py-2 border rounded md:col-span-2"
            placeholder="Apply Link (optional)"
            value={form.applyLink}
            onChange={e => setForm(f => ({ ...f, applyLink: e.target.value }))}
          />

          <textarea
            className="px-3 py-2 border rounded md:col-span-2"
            placeholder="Description"
            value={form.desc}
            onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
          />
        </div>

        <div className="mt-2 flex gap-2 items-center">
          <button
            type="button"
            onClick={create}
            className={`px-3 py-2 rounded text-white ${user && user.role === "teacher" ? "bg-indigo-600" : "bg-indigo-400"}`}
            title={user && user.role === "teacher" ? "Post opportunity" : "You are not a teacher — will post as community item"}
          >
            Post
          </button>

          <div className="ml-auto flex gap-2 items-center">
            <span className="text-sm text-gray-600 mr-2">Filter:</span>
            <button type="button" onClick={() => setFilterType("all")} className={`px-2 py-1 rounded ${filterType==="all" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}>All</button>
            <button type="button" onClick={() => setFilterType("internship")} className={`px-2 py-1 rounded ${filterType==="internship" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}>Internships</button>
            <button type="button" onClick={() => setFilterType("hackathon")} className={`px-2 py-1 rounded ${filterType==="hackathon" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}>Hackathons</button>
            <button type="button" onClick={() => setFilterType("research")} className={`px-2 py-1 rounded ${filterType==="research" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}>Research</button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Open Opportunities</h3>

        <div className="mt-3 space-y-3">
          {filtered.length === 0 && <p className="text-gray-500">No opportunities yet.</p>}
          {filtered.map(p => (
            <div key={p.id} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{p.title} <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{p.type}</span></div>
                  <div className="text-xs text-gray-500">{p.org} • posted by {p.postedBy}</div>
                </div>

                <div className="text-xs text-gray-500">{(p.applicants || []).length} applicants</div>
              </div>

              <p className="text-sm mt-2">{p.desc}</p>

              <div className="mt-2 flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => apply(p.id)}
                  disabled={hasApplied(p)}
                  className={`px-3 py-1 rounded ${hasApplied(p) ? "bg-gray-300 text-gray-700 cursor-not-allowed" : "bg-green-600 text-white"}`}
                >
                  {hasApplied(p) ? "Applied" : "Apply"}
                </button>

                {p.applyLink && (
                  <a
                    href={p.applyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded border"
                  >
                    More
                  </a>
                )}

                {/* delete if author or teacher */}
                {(p.postedById === uid || (user && user.role === "teacher")) && (
                  <button type="button" onClick={() => removePost(p.id)} className="px-3 py-1 rounded bg-red-500 text-white">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
