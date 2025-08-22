// src/components/pages/StudyRoomPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useLocalStorage from "../../hooks/useLocalStorage";
import RoomChat from "../chat/RoomChat";
import { Plus, LogOut, Trash2 } from "lucide-react";

/**
 * Local storage shape:
 * rooms_v1: Room[] where Room = { id, name, ownerId, members, createdAt }
 * Messages are stored by RoomChat under key: room_chat_<roomId>
 */
export default function StudyRoomPage({ studyRoomId }) {
  const { user } = useAuth();
  const uid = user?._id || user?.id || "guest";

  const [rooms, setRooms] = useLocalStorage("rooms_v1", []);
  const [roomName, setRoomName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [selectedId, setSelectedId] = useState(studyRoomId || null);

  // Only show rooms where user is a member or owner
  const myRooms = useMemo(() => {
    return rooms.filter((r) => r.ownerId === uid || (r.members || []).includes(uid));
  }, [rooms, uid]);

  // Auto-select a room (first one) if none selected
  useEffect(() => {
    if (!selectedId && myRooms.length > 0) {
      setSelectedId(myRooms[0].id);
    }
  }, [selectedId, myRooms]);

  const createRoom = () => {
    const name = roomName.trim();
    if (!name) return;
    const room = {
      id: crypto.randomUUID(),
      name,
      ownerId: uid,
      members: [uid],
      createdAt: Date.now(),
    };
    setRooms([room, ...rooms]);
    setRoomName("");
    setSelectedId(room.id);
  };

  const joinRoom = () => {
    const rid = joinId.trim();
    if (!rid) return;
    const exists = rooms.some((r) => r.id === rid);
    if (!exists) {
      alert("Room ID not found.");
      return;
    }
    setRooms((list) =>
      list.map((r) =>
        r.id === rid ? { ...r, members: [...new Set([...(r.members || []), uid])] } : r
      )
    );
    setJoinId("");
    setSelectedId(rid);
  };

  const leaveRoom = (rid) => {
    setRooms((list) =>
      list.map((r) =>
        r.id === rid
          ? { ...r, members: (r.members || []).filter((m) => m !== uid) }
          : r
      )
    );
    if (selectedId === rid) setSelectedId(null);
  };

  const deleteRoom = (rid) => {
  const room = rooms.find((r) => r.id === rid);
  if (!room || room.ownerId !== uid) return;

  // ✅ use window.confirm to satisfy eslint(no-restricted-globals)
  if (!window.confirm(`Delete room “${room.name}”?`)) return;

  setRooms((list) => list.filter((r) => r.id !== rid));
  if (selectedId === rid) setSelectedId(null);
  // optional: localStorage.removeItem(`room_chat_${rid}`);
};


  const selectedRoom = rooms.find((r) => r.id === selectedId) || null;
  const canDelete = selectedRoom && selectedRoom.ownerId === uid;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      {/* LEFT: Rooms list & actions */}
      <aside className="bg-white rounded-xl shadow p-4 h-fit">
        <h2 className="text-lg font-semibold mb-3">My Rooms</h2>

        {/* Create room */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder="New room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createRoom()}
            />
            <button
              onClick={createRoom}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-flex items-center gap-2"
              type="button"
            >
              <Plus size={16} /> Create
            </button>
          </div>
        </div>

        {/* Join via ID */}
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder="Join via Room ID"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            />
            <button
              onClick={joinRoom}
              className="px-3 py-2 rounded-lg border hover:bg-gray-50"
              type="button"
            >
              Join
            </button>
          </div>
        </div>

        {/* Rooms list */}
        {myRooms.length === 0 ? (
          <div className="text-sm text-gray-500">No rooms yet. Create or join one.</div>
        ) : (
          <ul className="space-y-1">
            {myRooms.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setSelectedId(r.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg border ${
                    selectedId === r.id ? "bg-indigo-50 border-indigo-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium">{r.name}</div>
                  <div className="text-[11px] text-gray-500">
                    Members: {(r.members || []).length} • ID: {r.id.slice(0, 8)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* RIGHT: Chat Pane */}
      <section className="space-y-4">
        {!selectedRoom ? (
          <div className="bg-white rounded-xl shadow p-6 text-gray-500">
            Select or create a room on the left.
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedRoom.name}</h2>
                <div className="text-sm text-gray-500">
                  Room ID: <span className="font-mono">{selectedRoom.id}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => leaveRoom(selectedRoom.id)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50"
                >
                  <LogOut size={16} /> Leave
                </button>
                {canDelete && (
                  <button
                    onClick={() => deleteRoom(selectedRoom.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            </div>

            <RoomChat
              roomKey={selectedRoom.id}
              placeholder={`Message ${selectedRoom.name}…`}
            />
          </>
        )}
      </section>
    </div>
  );
}
