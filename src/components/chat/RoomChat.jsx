import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useAuth } from "../../context/AuthContext";

/**
 * Props:
 * - roomKey (string): unique id for the study room (e.g. "global" or "room_<id>")
 * - placeholder (string): input placeholder override (optional)
 */
export default function RoomChat({ roomKey = "global", placeholder = "Type a message..." }) {
  const { user } = useAuth();
  const uid = user?._id || user?.id || "anon";
  const uname = user?.name || user?.username || "You";

  const storageKey = `room_chat_${roomKey}`;
  const [messages, setMessages] = useLocalStorage(storageKey, []); // [{id, userId, name, text, ts}]
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [othersTyping, setOthersTyping] = useState(false);

  const listRef = useRef(null);
  const bcRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Prepare BroadcastChannel for multi-tab sync
  useEffect(() => {
    const ch = new BroadcastChannel(`study_chat_${roomKey}`);
    bcRef.current = ch;

    ch.onmessage = (e) => {
      const { type, payload } = e.data || {};
      if (type === "new-message") {
        setMessages((prev) => {
          // avoid dupes
          if (prev.some((m) => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
        // scroll
        queueMicrotask(scrollToBottom);
      }
      if (type === "typing" && payload.userId !== uid) {
        setOthersTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setOthersTyping(false), 1200);
      }
      if (type === "bulk-sync") {
        setMessages(payload);
        queueMicrotask(scrollToBottom);
      }
    };

    // initial sync to new listeners
    ch.postMessage({ type: "bulk-sync", payload: messages });

    return () => {
      ch.close();
      clearTimeout(typingTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomKey]);

  // Auto-scroll to the bottom when messages change
  const scrollToBottom = () => {
    try {
      const el = listRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    } catch {}
  };

  useEffect(scrollToBottom, [messages]);

  const sendTyping = () => {
    try {
      bcRef.current?.postMessage({ type: "typing", payload: { userId: uid } });
    } catch {}
  };

  const sendMessage = async (e) => {
    e?.preventDefault?.();
    const txt = text.trim();
    if (!txt) return;

    if (!user) {
      alert("Please log in to chat.");
      return;
    }

    setIsSending(true);
    const msg = {
      id: crypto.randomUUID(),
      userId: uid,
      name: uname,
      text: txt,
      ts: Date.now(),
    };

    // local append
    setMessages((prev) => [...prev, msg]);
    setText("");
    queueMicrotask(scrollToBottom);

    // broadcast to other tabs (frontend realtime)
    try {
      bcRef.current?.postMessage({ type: "new-message", payload: msg });
    } catch {}

    setIsSending(false);
  };

  const grouped = useMemo(() => {
    // simple day grouping
    const byDay = {};
    for (const m of messages) {
      const d = new Date(m.ts);
      const key = d.toDateString();
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(m);
    }
    return byDay;
  }, [messages]);

  return (
    <div className="bg-white rounded-xl shadow p-0 overflow-hidden flex flex-col h-[520px]">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="font-semibold">Room Chat</div>
        {othersTyping && (
          <div className="text-xs text-gray-500 animate-pulse">Someone is typing…</div>
        )}
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {Object.keys(grouped).length === 0 && (
          <div className="text-center text-gray-400 mt-16">No messages yet. Say hi 👋</div>
        )}

        {Object.entries(grouped).map(([day, list]) => (
          <div key={day} className="mb-4">
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-gray-200" />
              <div className="text-[11px] text-gray-500">{day}</div>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {list.map((m) => {
              const mine = m.userId === uid;
              return (
                <div key={m.id} className={`flex mb-2 ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      mine
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white border rounded-bl-none"
                    }`}
                  >
                    {!mine && (
                      <div className="text-[11px] text-gray-500 mb-0.5">{m.name}</div>
                    )}
                    <div className="whitespace-pre-wrap break-words">{m.text}</div>
                    <div className={`text-[10px] mt-1 ${mine ? "text-indigo-100" : "text-gray-400"}`}>
                      {new Date(m.ts).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Composer */}
      <form onSubmit={sendMessage} className="p-3 border-t flex items-center gap-2">
        <input
          className="flex-1 px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={sendTyping}
        />
        <button
          type="submit"
          disabled={isSending || !text.trim()}
          className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
          title="Send"
        >
          {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
