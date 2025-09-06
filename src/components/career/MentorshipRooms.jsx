// src/components/career/MentorshipRooms.jsx
import React, { useState } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useAuth } from "../../context/AuthContext";

export default function MentorshipRooms() {
  const { user } = useAuth();
  const uid = user?._id || user?.id || "anon";
  const [rooms, setRooms] = useLocalStorage("mentorshipRooms_v1", []);
  const [form, setForm] = useState({ title: "", topic: "", isPrivate: false });

  const createRoom = () => {
    if (!form.title.trim()) return alert("Room title required");
    const r = {
      id: Date.now().toString(),
      ...form,
      mentorIds: user?.role === "teacher" ? [uid] : [],
      bookings: []
    };
    setRooms(prev => [r, ...prev]);
    setForm({ title: "", topic: "", isPrivate: false });
  };

  const requestBooking = (roomId) => {
    if (!user) return alert("Please login to request");
    setRooms(prev => prev.map(r => r.id === roomId ? ({
      ...r,
      bookings: [...r.bookings, { id: Date.now().toString(), userId: uid, status: "requested", ts: Date.now() }]
    }) : r));
    alert("Booking requested (mock). Mentor will confirm.");
  };

  const confirmBooking = (roomId, bookingId) => {
    // mentor-only action
    if (user?.role !== "teacher") return alert("Only mentors can confirm (mock).");
    setRooms(prev => prev.map(r => r.id === roomId ? ({
      ...r,
      bookings: r.bookings.map(b => b.id === bookingId ? ({ ...b, status: "confirmed" }) : b)
    }) : r));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mentorship Rooms</h2>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Create Mentorship Room</h3>
        <div className="grid md:grid-cols-3 gap-2 mt-2">
          <input className="px-3 py-2 border rounded" placeholder="Room title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
          <input className="px-3 py-2 border rounded" placeholder="Topic / Focus" value={form.topic} onChange={e=>setForm(f=>({...f,topic:e.target.value}))} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isPrivate} onChange={e=>setForm(f=>({...f,isPrivate:e.target.checked}))} />
            <span>Private</span>
          </label>
        </div>
        <div className="mt-2">
          <button type="button" onClick={createRoom} className="px-3 py-2 bg-indigo-600 text-white rounded">Create Room</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Available Rooms</h3>
        <div className="mt-3 space-y-3">
          {rooms.length === 0 && <p className="text-gray-500">No mentorship rooms yet.</p>}
          {rooms.map(r => (
            <div key={r.id} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{r.title} {r.mentorIds?.length > 0 && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded ml-2">Mentor available</span>}</div>
                  <div className="text-xs text-gray-500">{r.topic}</div>
                </div>
                <div className="text-xs text-gray-500">{r.bookings?.length || 0} bookings</div>
              </div>

              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => requestBooking(r.id)} className="px-3 py-1 rounded bg-green-600 text-white">Request 1:1</button>
                {user?.role === "teacher" && r.bookings && r.bookings.map(b => (
                  <div key={b.id} className="text-xs ml-2">
                    <span>{b.userId} — {b.status}</span>
                    {b.status === "requested" && <button onClick={()=>confirmBooking(r.id, b.id)} className="ml-2 text-xs text-white bg-blue-600 px-2 py-0.5 rounded">Confirm</button>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
