export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "online" | "offline";
  lastSeen: string;
}

export interface Message {
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

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
}
