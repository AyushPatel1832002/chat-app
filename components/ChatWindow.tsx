"use client";

import { useEffect, useRef, useState, memo, useMemo } from "react";
import { useChatStore } from "@/store/useChatStore";
import { 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Smile, 
  Paperclip, 
  UserPlus, 
  Info,
  ChevronLeft,
  Search,
} from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ChatWindowSkeleton } from "./Skeleton";

export default function ChatWindow() {
  const activeRoom = useChatStore((state) => state.activeRoom);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const allMessages = useChatStore((state) => state.messages);
  const allTypingUsers = useChatStore((state) => state.typingUsers);
  const currentUser = useChatStore((state) => state.currentUser);
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const isConnected = useChatStore((state) => state.isConnected);
  
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const setMessages = useChatStore((state) => state.setMessages);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const availableUsers = useChatStore((state) => state.users);
  
  const messages = useMemo(() => {
    const rawMessages = allMessages[activeRoom || ""] || [];
    // Virtualization: Only render the last 100 messages to save DOM nodes
    return rawMessages.slice(-100);
  }, [allMessages[activeRoom || ""], activeRoom]);

  const typingUsers = useMemo(() => allTypingUsers[activeRoom || ""] || [], [allTypingUsers[activeRoom || ""], activeRoom]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  useEffect(() => {
    setIsMounted(true);
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

    if (activeRoom && !allMessages[activeRoom]) {
      fetchHistory();
    }
    
    // Join socket room
    if (socket) {
      socket.emit("join_room", activeRoom);
    }
  }, [activeRoom, socket, setMessages, allMessages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: isMounted ? "smooth" : "auto"
      });
    }
  }, [messages, activeRoom, isMounted]);

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
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950 relative overflow-hidden">
        {/* Optimized background: using a single radial gradient instead of expensive blur filters */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.08),transparent_70%)]" />
        
        <div className="z-10 text-center px-4 animate-fade-in">
          <div className="w-24 h-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-primary/20">
            <MessageSquare className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Select a Chat</h2>
          <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
            Choose a friend or a room from the sidebar to start your secure, real-time conversation on Aura.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <ChatWindowSkeleton />;
  }

  const isOnline = onlineUsers.includes(selectedUser?._id || "");

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/40 backdrop-blur-2xl sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <button className="md:hidden p-2 hover:bg-white/5 rounded-full text-slate-400">
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-white/10 flex items-center justify-center font-bold text-xl text-primary shadow-lg">
              {selectedUser?.name[0] || "?"}
            </div>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-slate-900 rounded-full shadow-lg" />
            )}
          </div>
          
          <div className="min-w-0">
            <h3 className="font-bold text-slate-100 truncate">{selectedUser?.name || "Select a chat"}</h3>
            <div className="flex items-center text-[11px]">
              {isConnected ? (
                <span className={`font-semibold ${isOnline ? "text-green-500" : "text-slate-500"}`}>
                  {isOnline ? "Active Now" : "Last seen recently"}
                </span>
              ) : (
                <span className="flex items-center text-amber-400">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5 animate-pulse" />
                  Connecting...
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-slate-400">
          <button className="p-2.5 hover:bg-white/5 rounded-xl transition-all active:scale-95">
            <Search className="w-5 h-5" />
          </button>
          {activeRoom && !activeRoom.includes("-") && (
            <div className="relative">
              <button 
                onClick={() => setShowUserList(!showUserList)}
                className={`p-2.5 rounded-xl transition-all active:scale-95 ${showUserList ? "bg-primary text-white" : "hover:bg-white/5"}`}
              >
                <UserPlus className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showUserList && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-72 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Add Members</p>
                      <button onClick={() => setShowUserList(false)} className="text-slate-500 hover:text-white">
                        <Smile className="w-4 h-4 rotate-45" />
                      </button>
                    </div>
                    
                    <div className="max-h-72 overflow-y-auto custom-scrollbar p-1">
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
                                  setShowUserList(false);
                                } else {
                                  const data = await res.json();
                                  alert(data.error || "Failed to add user");
                                }
                              } catch (error) {
                                console.error("Add member failed", error);
                              }
                            }}
                            className="w-full flex items-center space-x-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-left group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                              {user.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="p-8 text-center text-sm text-slate-500">No users found</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <button className="p-2.5 hover:bg-white/5 rounded-xl transition-all active:scale-95">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2.5 hover:bg-white/5 rounded-xl transition-all active:scale-95">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar relative"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
        
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser?._id;
          const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);
          
          return (
            <MessageItem 
              key={msg._id || msg.tempId || idx}
              msg={msg}
              isMe={isMe}
              showAvatar={showAvatar}
            />
          );
        })}
        
        {typingUsers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-3 text-slate-500 text-xs"
          >
            <div className="flex space-x-1 bg-white/5 p-2 rounded-2xl border border-white/5">
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" />
            </div>
            <span className="font-medium italic">{typingUsers[0]} is typing...</span>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-3xl border-t border-white/5">
        <form onSubmit={handleSend} className="flex items-center space-x-4 max-w-6xl mx-auto">
          <div className="flex items-center space-x-1">
            <button type="button" className="p-3 hover:bg-white/5 rounded-2xl text-slate-400 transition-all active:scale-90">
              <Paperclip className="w-5.5 h-5.5" />
            </button>
          </div>
          
          <div className="flex-1 relative group">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Message your friend..."
              className="w-full px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.05] transition-all text-sm shadow-inner"
            />
            <button 
              type="button" 
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg text-slate-500 transition-all"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          
          <motion.button 
            type="submit"
            disabled={!input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-primary hover:bg-indigo-500 disabled:opacity-20 disabled:hover:bg-primary text-white rounded-2xl transition-all shadow-xl shadow-primary/30 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}

// Memoized Message Item to reduce TBT
const MessageItem = memo(({ msg, isMe, showAvatar }: any) => {
  const time = useMemo(() => {
    return new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [msg.createdAt]);

  return (
    <div 
      className={`flex ${isMe ? "justify-end" : "justify-start"} items-end space-x-3 animate-fade-in`}
    >
      {!isMe && (
        <div className="w-8 h-8 flex-shrink-0">
          {showAvatar ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-[10px] font-bold text-primary shadow-lg">
              {msg.senderName[0]}
            </div>
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}
      
      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%] md:max-w-[70%]`}>
        {!isMe && showAvatar && (
          <span className="text-[10px] font-bold text-slate-500 ml-1 mb-1 uppercase tracking-wider">
            {msg.senderName}
          </span>
        )}
        
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isMe 
            ? "bg-primary text-white rounded-br-none shadow-primary/20" 
            : "bg-white/[0.05] backdrop-blur-md text-slate-200 rounded-bl-none border border-white/5"
        }`}>
          {msg.content}
        </div>
        
        <div className={`text-[9px] mt-1.5 flex items-center font-medium ${isMe ? "text-slate-500" : "text-slate-500 ml-1"}`}>
          {time}
          {isMe && (
            <span className={`ml-1.5 ${msg.delivered ? "text-primary" : "text-slate-600"}`}>
              {msg.delivered ? "Seen" : "Sent"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";

function MessageSquare({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
