import { create } from "zustand";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  // status?: string;
}

interface Message {
  _id?: string;
  senderId: string;
  senderName: string;
  content: string;
  roomId: string;
  createdAt: string;
  delivered: boolean;
  read: boolean;
  tempId?: string;
}

interface ChatState {
  currentUser: User | null;
  activeRoom: string | null;
  selectedUser: User | null;
  messages: Record<string, Message[]>; // roomId -> messages
  onlineUsers: string[]; // List of user IDs
  typingUsers: Record<string, string[]>; // roomId -> userNames
  isConnected: boolean;
  users: any[];
  rooms: any[];
  
  setCurrentUser: (user: User | null) => void;
  setActiveRoom: (roomId: string | null) => void;
  setSelectedUser: (user: User | null) => void;
  setMessages: (roomId: string, messages: Message[]) => void;
  addMessage: (roomId: string, message: Message) => void;
  updateMessage: (roomId: string, tempId: string, updates: Partial<Message>) => void;
  setOnlineUsers: (users: string[]) => void;
  setTyping: (roomId: string, userNames: string[]) => void;
  setConnectionStatus: (status: boolean) => void;
  setUsers: (users: any[]) => void;
  setRooms: (rooms: any[]) => void;
  addUser: (user: any) => void;
  addRoom: (room: any) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentUser: null,
  activeRoom: null,
  selectedUser: null,
  messages: {},
  onlineUsers: [],
  typingUsers: {},
  isConnected: false,
  users: [],
  rooms: [],

  setCurrentUser: (user) => set({ currentUser: user }),
  setActiveRoom: (roomId) => set({ activeRoom: roomId }),
  setSelectedUser: (user) => set({ selectedUser: user }),
  setMessages: (roomId, messages) => 
    set((state) => ({ 
      messages: { ...state.messages, [roomId]: messages } 
    })),
  addMessage: (roomId, message) => 
    set((state) => {
      const currentMessages = state.messages[roomId] || [];
      // Prevent duplicates by checking _id or tempId
      const isDuplicate = currentMessages.some(m => 
        (message._id && m._id === message._id) || 
        (message.tempId && m.tempId === message.tempId)
      );
      
      if (isDuplicate) return state;

      return {
        messages: {
          ...state.messages,
          [roomId]: [...currentMessages, message]
        }
      };
    }),

  updateMessage: (roomId, tempId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: (state.messages[roomId] || []).map((msg) =>
          msg.tempId === tempId ? { ...msg, ...updates } : msg
        )
      }
    })),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setTyping: (roomId, userNames) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [roomId]: userNames }
    })),
  setConnectionStatus: (status) => set({ isConnected: status }),
  setUsers: (users) => set({ users }),
  setRooms: (rooms) => set({ rooms }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
}));
