"use client";

import { useEffect, useState, memo, useMemo } from "react";
import { useChatStore } from "@/store/useChatStore";
import {
  Search,
  Settings,
  LogOut,
  MessageSquare,
  Hash,
  User,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarSkeleton } from "./Skeleton";

export default function Sidebar() {
  const users = useChatStore((state) => state.users);
  const rooms = useChatStore((state) => state.rooms);
  const setUsers = useChatStore((state) => state.setUsers);
  const setRooms = useChatStore((state) => state.setRooms);
  const addRoom = useChatStore((state) => state.addRoom);
  const [activeTab, setActiveTab] = useState<"messages" | "rooms">(
    "messages"
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 150); // Small debounce to keep it feeling snappy but avoid thrashing
    return () => clearTimeout(timer);
  }, [search]);

  const currentUser = useChatStore((state) => state.currentUser);
  const activeRoom = useChatStore((state) => state.activeRoom);
  const setActiveRoom = useChatStore((state) => state.setActiveRoom);
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const onlineUsers = useChatStore((state) => state.onlineUsers);

  const router = useRouter();

  const filteredUsers = useMemo(() => {
    return users.filter((u) => u?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [users, debouncedSearch]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => r?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()));
  }, [rooms, debouncedSearch]);

  const isLoading = users.length === 0 && rooms.length === 0;

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
        addRoom(room);

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
  if (isLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <aside className="w-80 flex flex-col border-r border-white/5 bg-slate-950/50 backdrop-blur-2xl hidden md:flex">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-sm animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-gradient">Aura</h2>
        </div>

        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-all active:scale-95">
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-400 transition-all active:scale-95"
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
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
            }}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.05] transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 mb-4 items-center justify-between">
        <div className="flex bg-white/5 p-1 rounded-xl w-full">
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 flex items-center justify-center space-x-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "messages"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Messages</span>
          </button>

          <button
            onClick={() => setActiveTab("rooms")}
            className={`flex-1 flex items-center justify-center space-x-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "rooms"
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Rooms</span>
          </button>
        </div>
        
        {activeTab === "rooms" && (
          <button
            onClick={handleCreateRoom}
            className="ml-2 p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all active:scale-90"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
        {isLoading ? (
          <SidebarSkeleton />
        ) : activeTab === "messages" ? (
          <div className="space-y-1">
            {filteredUsers.map((user: any) => {
              const currentUserId = currentUser?._id;
              const targetUserId = user?._id || user?.id;
              if (!currentUserId || !targetUserId) return null;

              const isOnline = onlineUsers.includes(targetUserId);
              const roomId = [currentUserId, targetUserId].sort().join("-");
              const isActive = activeRoom === roomId;

              return (
                <UserItem 
                  key={targetUserId}
                  user={user}
                  isActive={isActive}
                  isOnline={isOnline}
                  roomId={roomId}
                  setActiveRoom={setActiveRoom}
                  setSelectedUser={setSelectedUser}
                />
              );
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredRooms.map((room: any) => (
              <RoomItem 
                key={room._id}
                room={room}
                isActive={activeRoom === room._id}
                setActiveRoom={setActiveRoom}
                setSelectedUser={setSelectedUser}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-black/20 border-t border-white/5 backdrop-blur-md">
        <div className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
            {currentUser?.name?.[0] || "?"}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-slate-100">
              {currentUser?.name}
            </p>
            <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-bold">
              Personal Space
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

const UserItem = memo(({ user, isActive, isOnline, roomId, setActiveRoom, setSelectedUser }: any) => {
  return (
    <button
      onClick={() => {
        setActiveRoom(roomId);
        setSelectedUser(user);
      }}
      className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all group active:scale-[0.98] ${
        isActive
          ? "bg-primary text-white shadow-xl shadow-primary/20"
          : "hover:bg-white/[0.05] text-slate-400"
      }`}
    >
      <div className="relative">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
          isActive ? "bg-white/20 text-white" : "bg-white/5 text-primary"
        }`}>
          {user?.name?.[0] || "U"}
        </div>

        {isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-950 rounded-full shadow-lg" />
        )}
      </div>

      <div className="flex-1 text-left min-w-0">
        <p
          className={`font-semibold truncate ${
            isActive ? "text-white" : "text-slate-200 group-hover:text-white"
          }`}
        >
          {user?.name}
        </p>

        <p
          className={`text-xs truncate ${
            isActive ? "text-white/70" : "text-slate-500"
          }`}
        >
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>
    </button>
  );
});

UserItem.displayName = "UserItem";

// Optimized Room Item
const RoomItem = memo(({ room, isActive, setActiveRoom, setSelectedUser }: any) => {
  return (
    <button
      onClick={() => {
        setActiveRoom(room._id);
        setSelectedUser({
          _id: room._id,
          name: room.name,
          email: "Group Room",
        });
      }}
      className={`w-full flex items-center space-x-3 p-3 rounded-2xl transition-all group active:scale-[0.98] ${
        isActive
          ? "bg-primary text-white shadow-xl shadow-primary/20"
          : "hover:bg-white/[0.05] text-slate-400"
      }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold ${
        isActive ? "bg-white/20 text-white" : "bg-white/5 text-primary"
      }`}>
        <Hash className="w-6 h-6" />
      </div>

      <div className="flex-1 text-left min-w-0">
        <p
          className={`font-semibold truncate ${
            isActive ? "text-white" : "text-slate-200 group-hover:text-white"
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
});

RoomItem.displayName = "RoomItem";