"use client";

import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { Send, MoreVertical, Phone, Video, Smile, Paperclip, UserPlus, MessageSquare } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { fetchApi } from "@/lib/api";

export default function ChatWindow() {
  const { 
    activeRoom, 
    messages, 
    setMessages, 
    addMessage, 
    updateMessage,
    currentUser, 
    selectedUser,
    onlineUsers,
    typingUsers,
    isConnected 
  } = useChatStore();
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  useEffect(() => {
    setIsMounted(true);
    const fetchUsers = async () => {
      const res = await fetchApi("/api/users");
      if (res.ok) {
        const data = await res.json();
        setAvailableUsers(data.users);
      }
    };
    fetchUsers();
  }, []);

  // Load message history
  useEffect(() => {
    if (!activeRoom) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetchApi(`/api/messages/history?roomId=${activeRoom}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(activeRoom, data.messages);
        }
      } catch (error) {
        console.error("Failed to fetch history", error);
      } finally {
        setLoading(false);
      }
    };

    if (!messages[activeRoom]) {
      fetchHistory();
    }
    
    // Join socket room
    if (socket) {
      socket.emit("join_room", activeRoom);
    }
  }, [activeRoom, socket, setMessages, messages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeRoom]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeRoom || !currentUser) return;

    const tempId = "temp_" + Date.now();
    const messageContent = input;
    setInput("");

    // Optimistic Update
    const newMessage = {
      senderId: currentUser._id,
      senderName: currentUser.name,
      content: messageContent,
      roomId: activeRoom,
      createdAt: new Date().toISOString(),
      delivered: false,
      read: false,
      tempId,
    };

    addMessage(activeRoom, newMessage);

    // Send via socket for real-time
    if (socket) {
      socket.emit("send_message", {
        roomId: activeRoom,
        content: messageContent,
        tempId,
      });
      socket.emit("typing_stop", activeRoom);
    }

    // Persist via API - Removed as Socket server now handles persistence
    /*
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageContent,
          roomId: activeRoom,
          tempId,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        updateMessage(activeRoom, tempId, { _id: data.message._id, delivered: true });
      }
    } catch (error) {
      console.error("Failed to persist message", error);
    }
    */
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (socket && activeRoom) {
      socket.emit("typing_start", activeRoom);
      
      // Debounce typing stop
      const timeoutId = setTimeout(() => {
        socket.emit("typing_stop", activeRoom);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  };

  if (!activeRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#0f172a]">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <MessageSquare className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Your Conversations</h2>
        <p className="text-slate-400 max-w-sm">
          Select a friend from the sidebar to start a real-time conversation.
        </p>
      </div>
    );
  }

  const roomMessages = messages[activeRoom] || [];
  const roomTyping = typingUsers[activeRoom] || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0f172a]">
      {/* Header */}
      <header className="p-4 border-b border-white/5 flex items-center justify-between bg-black/10 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-primary">
            {selectedUser?.name[0] || "?"}
          </div>
          <div>
            <h3 className="font-semibold text-slate-200">{selectedUser?.name || "Select a chat"}</h3>
            <p className="text-xs text-slate-500">
              {isConnected ? (
                <span className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${onlineUsers.includes(selectedUser?._id || "") ? "bg-green-500" : "bg-slate-500"}`} />
                  {onlineUsers.includes(selectedUser?._id || "") ? "Online" : "Offline"}
                </span>
              ) : (
                <span className="flex items-center text-red-400">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                  Reconnecting...
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
          {activeRoom && !activeRoom.includes("-") && (
            <div className="relative">
              <button 
                onClick={() => setShowUserList(!showUserList)}
                className={`p-2 rounded-full transition-colors group ${showUserList ? "bg-primary/20 text-primary" : "hover:bg-white/5"}`}
                title="Add Member"
              >
                <UserPlus className="w-5 h-5" />
              </button>

              {showUserList && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-white/5 bg-black/20">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Add People</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {availableUsers.length > 0 ? (
                      availableUsers.map((user) => (
                        <button
                          key={user._id}
                          onClick={async () => {
                            try {
                              const res = await fetchApi("/api/rooms/add-member", {
                                method: "POST",
                                body: JSON.stringify({ roomId: activeRoom, userId: user._id }),
                              });
                              if (res.ok) {
                                alert(`${user.name} added to room!`);
                                setShowUserList(false);
                              } else {
                                const data = await res.json();
                                alert(data.error || "Failed to add user");
                              }
                            } catch (error) {
                              console.error("Add member failed", error);
                            }
                          }}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-white/5 transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {user.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-center text-xs text-slate-500">No users found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <Phone className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          <Video className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
        </div>
      </header>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
      >
        {loading && <div className="text-center text-xs text-slate-500">Loading history...</div>}
        
        {roomMessages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser?._id;
          return (
            <div 
              key={msg._id ? `msg-${msg._id}` : msg.tempId ? `temp-${msg.tempId}` : `idx-${idx}`}
              className={`flex ${isMe ? "justify-end" : "justify-start"} items-end space-x-2 animate-slide-in`}
            >

              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold mb-1">
                  {msg.senderName[0]}
                </div>
              )}
              <div className={`max-w-[70%] group relative`}>
                <div className={`px-4 py-2 rounded-2xl text-sm ${
                  isMe 
                    ? "bg-primary text-white rounded-br-none" 
                    : "bg-white/5 text-slate-200 rounded-bl-none border border-white/5"
                }`}>
                  {msg.content}
                </div>
                <div className={`text-[10px] mt-1 flex items-center ${isMe ? "justify-end text-slate-500" : "text-slate-500"}`}>
                  {isMounted && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && (
                    <span className="ml-1">
                      {msg.delivered ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {roomTyping.length > 0 && (
          <div className="flex items-center space-x-2 text-slate-500 text-xs animate-pulse">
            <div className="flex space-x-1">
              <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce delay-75" />
              <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce delay-150" />
            </div>
            <span>{roomTyping.join(", ")} is typing...</span>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 bg-black/10 backdrop-blur-md border-t border-white/5">
        <form onSubmit={handleSend} className="flex items-center space-x-3 max-w-5xl mx-auto">
          <div className="flex space-x-2">
            <button type="button" className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
            />
          </div>
          <button 
            type="submit"
            disabled={!input.trim()}
            className="p-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary text-white rounded-2xl transition-all shadow-lg shadow-primary/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
