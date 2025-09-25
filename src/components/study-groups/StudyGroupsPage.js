// src/components/study-groups/StudyGroupsPage.jsx
import React, { useState } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useAuth } from "../../context/AuthContext";
import { v4 as uuidv4 } from "uuid";

/**
 * StudyGroupsPage with lightweight AI features:
 * - AI topic suggestions on create
 * - Ask AI inside a group (Q&A)
 * - Summarize discussion (AI)
 *
 * Backend endpoints used:
 * POST /api/ai/suggest   -> { suggestions: [..] }
 * POST /api/ai/qa        -> { answer: "..." }
 * POST /api/ai/summary   -> { summary: "..." }
 *
 * Backend is optional — if not available, the frontend falls back to mock suggestions.
 */

function makeId() {
  try {
    return uuidv4();
  } catch (e) {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
}

async function fetchJson(url, body) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "AI backend error");
    }
    return await res.json();
  } catch (err) {
    console.warn("fetchJson error", err);
    throw err;
  }
}

export default function StudyGroupsPage({ onNavigate }) {
  const { user } = useAuth();
  const uid = user?._id || user?.id || "anon";
  const [groups, setGroups] = useLocalStorage("study_groups_v1", []);
  const [form, setForm] = useState({ title: "", topic: "", isPrivate: false });
  const [joinId, setJoinId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [message, setMessage] = useState("");

  // AI UI state
  const [aiSuggestLoading, setAiSuggestLoading] = useState(false);
  const [aiSuggests, setAiSuggests] = useState([]);
  const [aiQaLoading, setAiQaLoading] = useState(false);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  const createGroup = async () => {
    if (!form.title.trim()) return alert("Title required");

    // ask AI for subtopic suggestions (non-blocking but we show loader)
    let suggested = [];
    if (form.topic && form.topic.trim()) {
      setAiSuggestLoading(true);
      try {
        const json = await fetchJson("/api/ai/suggest", { topic: form.topic });
        suggested = Array.isArray(json.suggestions) ? json.suggestions : [];
      } catch (e) {
        // fallback: derive simple suggestions locally
        const t = (form.topic || "").toLowerCase();
        if (t.includes("ml") || t.includes("machine")) suggested = ["Supervised learning", "Model evaluation", "Kaggle practice"];
        else if (t.includes("web") || t.includes("react")) suggested = ["Component design", "State management", "API integration"];
        else suggested = ["Basics", "Project idea", "Further reading"];
      } finally {
        setAiSuggestLoading(false);
      }
    }

    const g = {
      id: makeId(),
      title: form.title.trim(),
      topic: form.topic.trim(),
      isPrivate: !!form.isPrivate,
      ownerId: uid,
      ownerName: user?.name || "anon",
      members: [uid],
      memberNames: [user?.name || "anon"],
      requests: [],
      messages: [],
      aiSuggestions: suggested,
      aiSummary: ""
    };
    setGroups(prev => [g, ...prev]);
    setForm({ title: "", topic: "", isPrivate: false });
    setSelectedGroupId(g.id);
    if (suggested && suggested.length > 0) {
      alert("AI suggestions added to group (view inside).");
    }
  };

  const joinGroup = (id) => {
    const g = groups.find(x => x.id === id);
    if (!g) return alert("Group not found");
    if ((g.members || []).includes(uid)) return alert("Already a member");
    if (g.isPrivate) {
      setGroups(prev => prev.map(x =>
        x.id === id ? ({ ...x, requests: [{ id: makeId(), userId: uid, name: user?.name || "anon" }, ...(x.requests||[])] }) : x
      ));
      alert("Request sent to group owner");
    } else {
      setGroups(prev => prev.map(x =>
        x.id === id ? ({ ...x, members: [...new Set([...(x.members||[]), uid])], memberNames: [...new Set([...(x.memberNames||[]), user?.name || "anon"])] }) : x
      ));
      alert("Joined group");
      setSelectedGroupId(id);
    }
    setJoinId("");
  };

  const acceptRequest = (groupId, reqId) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      const req = (g.requests||[]).find(r=>r.id===reqId);
      if (!req) return g;
      return {
        ...g,
        requests: (g.requests||[]).filter(r=>r.id!==reqId),
        members: [...new Set([...(g.members||[]), req.userId])],
        memberNames: [...new Set([...(g.memberNames||[]), req.name])]
      };
    }));
  };

  const declineRequest = (groupId, reqId) => {
    setGroups(prev => prev.map(g => g.id === groupId ? ({ ...g, requests: (g.requests||[]).filter(r=>r.id!==reqId) }) : g));
  };

  const sendMessage = (groupId) => {
    if (!message.trim()) return;
    setGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      if (! (g.members || []).includes(uid)) return g;
      const m = { id: makeId(), userId: uid, name: user?.name || "anon", text: message.trim(), ts: Date.now() };
      return { ...g, messages: [...(g.messages||[]), m] };
    }));
    setMessage("");
  };

  const leaveGroup = (groupId) => {
    const ok = window.confirm("Leave group?");
    if (!ok) return;
    setGroups(prev => prev.map(g => g.id === groupId ? ({ ...g, members: (g.members||[]).filter(x=>x!==uid), memberNames: (g.memberNames||[]) }) : g));
    if (selectedGroupId === groupId) setSelectedGroupId(null);
  };

  const deleteGroup = (groupId) => {
    const ok = window.confirm("Delete group?");
    if (!ok) return;
    setGroups(prev => prev.filter(g => g.id !== groupId));
    if (selectedGroupId === groupId) setSelectedGroupId(null);
  };

  const copyId = async (g) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(g.id);
        alert("Group ID copied");
      } catch (err) {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = g.id;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        alert("Group ID copied (fallback)");
      }
    } else {
      const ta = document.createElement("textarea");
      ta.value = g.id;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("Group ID copied (fallback)");
    }
  };

  // Ask AI inside a group (Q&A)
  const askAI = async (groupId, question) => {
    if (!question || !question.trim()) return alert("Type a question");
    setAiQaLoading(true);
    // Append a local message from user
    setGroups(prev => prev.map(g => g.id === groupId ? ({ ...g, messages: [...(g.messages||[]), { id: makeId(), userId: uid, name: user?.name || "You", text: question, ts: Date.now(), fromAI: false }] }) : g));
    try {
      const resp = await fetchJson("/api/ai/qa", { question, context: (groups.find(g=>g.id===groupId)?.messages || []).slice(-50) });
      const answer = resp?.answer || "Sorry, I couldn't generate an answer right now.";
      // append AI response as message
      setGroups(prev => prev.map(g => g.id === groupId ? ({ ...g, messages: [...(g.messages||[]), { id: makeId(), userId: "ai", name: "StudyAI", text: answer, ts: Date.now(), fromAI: true }] }) : g));
    } catch (e) {
      // fallback short canned reply
      const fallback = "Here's a suggested approach: break the problem into smaller tasks, search examples on GitHub, and try a small prototype.";
      setGroups(prev => prev.map(g => g.id === groupId ? ({ ...g, messages: [...(g.messages||[]), { id: makeId(), userId: "ai", name: "StudyAI", text: fallback, ts: Date.now(), fromAI: true }] }) : g));
    } finally {
      setAiQaLoading(false);
    }
  };

  // Summarize messages via AI
  const summarizeGroup = async (groupId) => {
    setAiSummaryLoading(true);
    const g = groups.find(x => x.id === groupId);
    const msgs = (g?.messages || []).slice(-200).map(m => ({ text: m.text, name: m.name }));
    try {
      const resp = await fetchJson("/api/ai/summary", { messages: msgs });
      const summary = resp?.summary || "No summary available.";
      setGroups(prev => prev.map(gr => gr.id === groupId ? ({ ...gr, aiSummary: summary }) : gr));
    } catch (e) {
      // fallback: simple extractive summary (last 3 messages)
      const lastThree = (g?.messages || []).slice(-3).map(m => `${m.name}: ${m.text}`).join(" / ");
      setGroups(prev => prev.map(gr => gr.id === groupId ? ({ ...gr, aiSummary: `Recent: ${lastThree}` }) : gr));
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const selected = groups.find(g => g.id === selectedGroupId);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Study Groups</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Create Study Group</h3>
          <input className="w-full mt-2 px-3 py-2 border rounded" placeholder="Group title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
          <input className="w-full mt-2 px-3 py-2 border rounded" placeholder="Topic / focus (e.g., Machine Learning)" value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})} />
          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" checked={form.isPrivate} onChange={e=>setForm({...form,isPrivate:e.target.checked})} />
            <span className="text-sm">Private (join requests)</span>
          </label>

          <div className="mt-3 flex gap-2 items-center">
            <button onClick={createGroup} className="px-3 py-2 bg-indigo-600 text-white rounded">Create Group</button>
            <button onClick={async () => {
              // show suggestions without creating (preview)
              if (!form.topic || !form.topic.trim()) return alert("Enter a topic to get suggestions");
              setAiSuggestLoading(true);
              try {
                const json = await fetchJson("/api/ai/suggest", { topic: form.topic });
                setAiSuggests(Array.isArray(json.suggestions) ? json.suggestions : []);
              } catch (e) {
                const t = (form.topic || "").toLowerCase();
                if (t.includes("ml") || t.includes("machine")) setAiSuggests(["Supervised learning", "Model evaluation", "Kaggle practice"]);
                else if (t.includes("web") || t.includes("react")) setAiSuggests(["Component design", "State management", "API integration"]);
                else setAiSuggests(["Basics", "Project idea", "Further reading"]);
              } finally {
                setAiSuggestLoading(false);
              }
            }} className="px-3 py-2 border rounded">{aiSuggestLoading ? "Thinking..." : "Get AI suggestions"}</button>
          </div>

          {aiSuggests.length > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <div className="font-medium text-sm">AI Suggestions</div>
              <ul className="list-disc ml-6 mt-1">
                {aiSuggests.map((s,i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Join Group by ID</h3>
          <input className="w-full mt-2 px-3 py-2 border rounded" placeholder="Paste group id" value={joinId} onChange={e=>setJoinId(e.target.value)} />
          <div className="mt-3">
            <button onClick={()=>joinGroup(joinId)} className="px-3 py-2 bg-green-600 text-white rounded">Join</button>
          </div>
          <div className="mt-4 text-sm text-gray-600">Tip: Click a group from the list to copy its ID.</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Available Groups</h3>
        <div className="grid gap-2 mt-3">
          {groups.length === 0 && <div className="text-gray-500">No groups yet.</div>}
          {groups.map(g => (
            <div key={g.id} className="p-3 border rounded flex justify-between items-start">
              <div>
                <div className="font-semibold">{g.title} <span className="text-xs ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-700">{g.topic || "General"}</span></div>
                <div className="text-xs text-gray-500">Owner: {g.ownerName} • {g.isPrivate ? "Private" : "Public"}</div>
                <div className="text-xs text-gray-500 mt-1">{(g.members||[]).length} members</div>
                {g.aiSuggestions && g.aiSuggestions.length > 0 && <div className="text-xs text-indigo-700 mt-1">AI: {g.aiSuggestions.slice(0,2).join(", ")}{g.aiSuggestions.length>2 ? "..." : ""}</div>}
              </div>

              <div className="flex flex-col items-end gap-2">
                <button onClick={() => copyId(g)} className="px-2 py-1 rounded border">Copy ID</button>
                <button onClick={() => setSelectedGroupId(g.id)} className="px-2 py-1 rounded bg-indigo-600 text-white">Open</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{selected.title} <span className="text-xs text-gray-500 ml-2">{selected.topic}</span></h3>
              <div className="text-sm text-gray-500">Owner: {selected.ownerName}</div>
              <div className="text-sm text-gray-500">{(selected.members||[]).length} members</div>
            </div>

            <div className="flex gap-2">
              {(selected.ownerId === uid) && <button onClick={()=>deleteGroup(selected.id)} className="px-3 py-1 rounded bg-red-500 text-white">Delete</button>}
              <button onClick={()=>leaveGroup(selected.id)} className="px-3 py-1 rounded border">Leave</button>
            </div>
          </div>

          {selected.ownerId === uid && (selected.requests || []).length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium">Join requests</h4>
              <div className="flex gap-2 mt-2">
                {(selected.requests || []).map(r => (
                  <div key={r.id} className="p-2 border rounded flex items-center justify-between w-full">
                    <div>
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-gray-500">id: {r.userId}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>acceptRequest(selected.id, r.id)} className="px-2 py-1 rounded bg-green-600 text-white">Accept</button>
                      <button onClick={()=>declineRequest(selected.id, r.id)} className="px-2 py-1 rounded border">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3">
            <h4 className="font-medium">Members</h4>
            <div className="flex gap-2 mt-2 flex-wrap">
              {(selected.memberNames || []).map((n, i) => <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">{n}</span>)}
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium">Messages</h4>
            <div className="border rounded p-3 h-48 overflow-auto mt-2 bg-gray-50">
              {(selected.messages || []).length === 0 && <div className="text-gray-500">No messages yet.</div>}
              {(selected.messages || []).map(m => (
                <div key={m.id} className={`mb-2 ${m.userId === uid ? "text-right" : ""}`}>
                  <div className="text-xs text-gray-600">{m.name} • {new Date(m.ts).toLocaleString()}</div>
                  <div className="mt-1">{m.text}</div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex gap-2">
              <input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Write a message (members only)" className="flex-1 px-3 py-2 border rounded" />
              <button onClick={()=>sendMessage(selected.id)} className="px-3 py-2 bg-indigo-600 text-white rounded">Send</button>
            </div>

            <div className="mt-3 flex gap-2 items-center">
              <input placeholder="Ask AI (e.g., explain CNN intuition)" id="aiQuestion" className="flex-1 px-3 py-2 border rounded" />
              <button onClick={() => {
                const q = document.getElementById("aiQuestion").value;
                document.getElementById("aiQuestion").value = "";
                askAI(selected.id, q);
              }} className="px-3 py-2 bg-purple-600 text-white rounded">{aiQaLoading ? "Thinking..." : "Ask AI"}</button>

              <button onClick={() => summarizeGroup(selected.id)} className="px-3 py-2 border rounded">{aiSummaryLoading ? "Summarizing..." : "Summarize"}</button>
            </div>

            {selected.aiSummary && (
              <div className="mt-3 p-3 bg-yellow-50 rounded">
                <div className="font-medium">AI Summary</div>
                <div className="text-sm mt-1">{selected.aiSummary}</div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
