import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Send, Trash2, Loader2 } from "lucide-react";

export default function CourseDiscussion({ courseId }) {
  const { user } = useAuth();
  const uid = user?._id || user?.id || "guest";
  const uname = user?.name || user?.username || "User";
  const urole = user?.role || "student";

  const storageKey = `course_discussion_${courseId}`;
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  });
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(messages)); } catch {}
  }, [messages, storageKey]);

  const scrollBottom = () => {
    const el = listRef.current; if (!el) return;
    el.scrollTop = el.scrollHeight;
  };
  useEffect(scrollBottom, [messages]);

  const post = (e) => {
    e?.preventDefault?.();
    const t = text.trim();
    if (!t) return;
    setSending(true);
    const msg = {
      id: crypto.randomUUID(),
      userId: uid,
      name: uname,
      role: urole, // "teacher" or "student"
      text: t,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setText("");
    setSending(false);
  };

  const remove = (id) => {
    // author or teacher can delete
    setMessages((prev) => prev.filter((m) => m.id !== id || !(m.userId === uid || urole === "teacher")));
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="px-4 py-3 border-b font-semibold">Discussion</div>

      <div ref={listRef} className="max-h-[380px] overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">No messages yet. Start the discussion 👋</div>
        )}
        {messages.map((m) => {
          const mine = m.userId === uid;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border rounded-bl-none"}`}>
                <div className={`text-[11px] ${mine ? "text-indigo-100" : "text-gray-500"} mb-0.5`}>
                  {m.name} {m.role === "teacher" && "• Teacher"}
                </div>
                <div className="whitespace-pre-wrap break-words">{m.text}</div>
                <div className={`text-[10px] mt-1 ${mine ? "text-indigo-100" : "text-gray-400"}`}>
                  {new Date(m.ts).toLocaleString()}
                </div>
                {(mine || urole === "teacher") && (
                  <button
                    className={`mt-1 text-[11px] inline-flex items-center gap-1 ${mine ? "text-indigo-100 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => remove(m.id)}
                    title="Delete message"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={post} className="p-3 border-t flex items-center gap-2">
        <input
          className="flex-1 px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Write a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
          title="Send"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
