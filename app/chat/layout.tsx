"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/useChatStore";
import Sidebar from "@/components/Sidebar";
import { useSocket } from "@/hooks/useSocket";
import { fetchApi } from "@/lib/api";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, setCurrentUser } = useChatStore();
  const router = useRouter();
  
  // Initialize socket connection
  useSocket();

  useEffect(() => {
    const fetchUser = async () => {
      if (!currentUser) {
        try {
          const res = await fetchApi("/api/auth/me");

          if (res.ok) {
            const data = await res.json();
            console.log("Auth check success:", data.user);
            if (data.user && data.user.name) {
              setCurrentUser(data.user);
            } else {
              console.error("User data incomplete:", data.user);
              router.push("/login");
            }
          } else {
            setCurrentUser(null);
            router.push("/login");
          }
        } catch (error) {
          router.push("/login");
        }
      }
    };

    fetchUser();
  }, [currentUser, setCurrentUser, router]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 animate-pulse">Initializing your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}

