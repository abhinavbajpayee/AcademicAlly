import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useLocalStorage from "../../hooks/useLocalStorage";
import { UserPlus, Check, X, Search } from "lucide-react";

// mock directory (demo users to search)
const DIRECTORY = [
  { id: "u_arya", name: "Arya Sharma", branch: "CSE" },
  { id: "u_rahul", name: "Rahul Verma", branch: "ECE" },
  { id: "u_sana", name: "Sana Khan", branch: "IT" },
  { id: "u_meera", name: "Meera Iyer", branch: "AI/ML" },
  { id: "u_kabir", name: "Kabir Singh", branch: "ME" },
];

export default function FriendsPage() {
  const { user } = useAuth();
  const uid = user?.id || user?._id || "guest";

  // store per-user
  const [friends, setFriends] = useLocalStorage(`aa_friends_${uid}`, []);
  const [incoming, setIncoming] = useLocalStorage(`aa_incoming_${uid}`, []);
  const [sent, setSent] = useLocalStorage(`aa_sent_${uid}`, []);
  const [q, setQ] = useState("");

  // search available users not already friend/sent
  const results = useMemo(() => {
    const S = q.toLowerCase();
    return DIRECTORY.filter(
      (u) =>
        u.id !== uid &&
        !friends.includes(u.id) &&
        !sent.includes(u.id) &&
        !incoming.includes(u.id) &&
        (u.name.toLowerCase().includes(S) || u.branch.toLowerCase().includes(S))
    ).slice(0, 8);
  }, [q, uid, friends, sent, incoming]);

  const sendRequest = (targetId) => {
    setSent([...sent, targetId]);
    // NOTE: in a real app we'd write to target's incoming; for demo only one user profile is used.
  };

  const accept = (fromId) => {
    setFriends([...friends, fromId]);
    setIncoming(incoming.filter((x) => x !== fromId));
  };
  const reject = (fromId) => setIncoming(incoming.filter((x) => x !== fromId));

  return (
    <div className="space-y-8">
      {/* Search & send */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Add Friends</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              className="pl-9 pr-3 py-2 border rounded-lg w-full"
              placeholder="Search by name or branch"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((u) => (
            <div key={u.id} className="border rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-gray-500">{u.branch}</p>
              </div>
              <button
                onClick={() => sendRequest(u.id)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <UserPlus size={16} /> Request
              </button>
            </div>
          ))}
          {results.length === 0 && (
            <p className="text-gray-500">No users found (or already requested).</p>
          )}
        </div>
      </div>

      {/* Incoming requests */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Incoming Requests</h3>
        {incoming.length === 0 ? (
          <p className="text-gray-500">No pending requests.</p>
        ) : (
          <div className="space-y-2">
            {incoming.map((id) => {
              const u = DIRECTORY.find((x) => x.id === id) || { name: id };
              return (
                <div key={id} className="border rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.branch || "Student"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => accept(id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Check size={16} /> Accept
                    </button>
                    <button
                      onClick={() => reject(id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      <X size={16} /> Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Friends list */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-3">Your Friends</h3>
        {friends.length === 0 ? (
          <p className="text-gray-500">You haven’t added any friends yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {friends.map((id) => {
              const u = DIRECTORY.find((x) => x.id === id) || { name: id, branch: "" };
              return (
                <div key={id} className="border rounded-xl p-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.branch}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
