"use client";

import { useEffect, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import {
  Search,
  Settings,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

export default function Sidebar() {
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"messages" | "rooms">(
    "messages"
  );
  const [search, setSearch] = useState("");

  const {
    currentUser,
    activeRoom,
    setActiveRoom,
    setSelectedUser,
    onlineUsers,
  } = useChatStore();

  const router = useRouter();

  const filteredUsers = users.filter((u) =>
    u?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredRooms = rooms.filter((r) =>
    r?.name?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, roomsRes] = await Promise.all([
          fetchApi("/api/users"),
          fetchApi("/api/rooms"),
        ]);

        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.users || []);
        }

        if (roomsRes.ok) {
          const data = await roomsRes.json();
          setRooms(data.rooms || []);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateRoom = async () => {
    const name = prompt("Enter room name:");

    if (!name) return;

    try {
      const res = await fetchApi("/api/rooms/create", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const { room } = await res.json();

        setRooms((prev) => [...prev, room]);

        setActiveTab("rooms");
        setActiveRoom(room._id);

        setSelectedUser({
          _id: room._id,
          name: room.name,
          email: "Group Room",
        });
      }
    } catch (error) {
      console.error("Failed to create room", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetchApi("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <aside className="w-80 flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl hidden md:flex">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gradient">Aura</h2>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-400/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />

          <input
            type="text"
            placeholder={
              activeTab === "messages"
                ? "Search conversations..."
                : "Search rooms..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 space-x-4 mb-4 items-center justify-between">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("messages")}
            className={`text-xs font-bold uppercase tracking-wider pb-2 transition-all ${
              activeTab === "messages"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Messages
          </button>

          <button
            onClick={() => setActiveTab("rooms")}
            className={`text-xs font-bold uppercase tracking-wider pb-2 transition-all ${
              activeTab === "rooms"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Rooms
          </button>
        </div>

        {activeTab === "rooms" && (
          <button
            onClick={handleCreateRoom}
            className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-all font-bold"
          >
            + NEW
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 p-3 animate-pulse"
              >
                <div className="w-12 h-12 bg-white/5 rounded-full" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="h-2 bg-white/5 rounded w-3/4" />
                </div>
              </div>
            ))
        ) : activeTab === "messages" ? (
          <>
            {Array.from(
              new Map(filteredUsers.map((u) => [u._id, u])).values()
            ).map((user: any, idx) => {
              const currentUserId = String(
                currentUser?._id || currentUser?._id || ""
              );

              const targetUserId = String(user?._id || user?.id || "");

              if (!currentUserId || !targetUserId) return null;

              const isOnline = onlineUsers.includes(targetUserId);

              const roomId = [currentUserId, targetUserId]
                .sort()
                .join("-");

              const isActive = activeRoom === roomId;

              return (
                <button
                  key={user?._id || `user-${idx}`}
                  onClick={() => {
                    setActiveRoom(roomId);
                    setSelectedUser(user);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "hover:bg-white/5 text-slate-400"
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-bold text-primary">
                      {user?.name?.[0] || "U"}
                    </div>

                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0f172a] rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <p
                      className={`font-semibold truncate ${
                        isActive ? "text-white" : "text-slate-200"
                      }`}
                    >
                      {user?.name}
                    </p>

                    <p
                      className={`text-xs truncate ${
                        isActive ? "text-white/70" : "text-slate-500"
                      }`}
                    >
                      {isOnline ? "Active now" : "Offline"}
                    </p>
                  </div>
                </button>
              );
            })}
          </>
        ) : (
          <>
            {Array.from(
              new Map(filteredRooms.map((r) => [r._id, r])).values()
            ).map((room: any, idx) => {
              const isActive = activeRoom === room._id;

              return (
                <button
                  key={room?._id || `room-${idx}`}
                  onClick={() => {
                    setActiveRoom(room._id);

                    setSelectedUser({
                      _id: room._id,
                      name: room.name,
                      email: "Group Room",
                    });
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "hover:bg-white/5 text-slate-400"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-white/10">
                    <MessageSquare className="w-6 h-6" />
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <p
                      className={`font-semibold truncate ${
                        isActive ? "text-white" : "text-slate-200"
                      }`}
                    >
                      {room?.name}
                    </p>

                    <p
                      className={`text-xs truncate ${
                        isActive ? "text-white/70" : "text-slate-500"
                      }`}
                    >
                      {room?.description || "Group Chat"}
                    </p>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 mt-auto border-t border-white/5 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {currentUser?.name?.[0] || "?"}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {currentUser?.name}
            </p>

            <p className="text-xs text-slate-500 truncate">
              {currentUser?.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}