"use client";

import dynamic from "next/dynamic";
import { ChatWindowSkeleton } from "@/components/Skeleton";

const ChatWindow = dynamic(() => import("@/components/ChatWindow"), {
  loading: () => <ChatWindowSkeleton />,
});

export default function ChatPage() {
  return <ChatWindow />;
}
