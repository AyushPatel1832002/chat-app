import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useChatStore } from "@/store/useChatStore";
import { SOCKET_URL } from "@/lib/api";


export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const currentUser = useChatStore((state) => state.currentUser);
  const setConnectionStatus = useChatStore((state) => state.setConnectionStatus);
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
  const setTyping = useChatStore((state) => state.setTyping);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);

  useEffect(() => {
    if (!currentUser) return;

    if (!socketRef.current) {
      console.log("Initializing socket connection for:", currentUser.name);
      socketRef.current = io(SOCKET_URL, {
        query: { 
          userId: String(currentUser?._id || currentUser?.id || ""), 
          name: String(currentUser?.name || "") 
        },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      const socket = socketRef.current;

      socket.on("connect", () => {
        setConnectionStatus(true);
        console.log("Connected to socket server");
      });

      socket.on("disconnect", () => {
        setConnectionStatus(false);
        console.log("Disconnected from socket server");
      });

      socket.on("new_message", (message) => {
        addMessage(message.roomId, message);
      });

      socket.on("message_delivered", ({ roomId, tempId, messageId }) => {
        updateMessage(roomId, tempId, { _id: messageId, delivered: true });
      });

      socket.on("online_users", (users) => {
        setOnlineUsers(users);
      });

      socket.on("user_typing", ({ roomId, userNames }) => {
        setTyping(roomId, userNames);
      });
    }

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentUser?._id, currentUser?.id]); // Only reconnect if user ID changes


  return socketRef.current;
};
