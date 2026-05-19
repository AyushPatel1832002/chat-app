"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/useChatStore";
import { useSocket } from "@/hooks/useSocket";
import { fetchApi } from "@/lib/api";
import dynamic from "next/dynamic";
import { SidebarSkeleton } from "@/components/Skeleton";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = dynamic(() => import("@/components/Sidebar"), {
  loading: () => <SidebarSkeleton />,
});

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useChatStore((state) => state.currentUser);
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);
  const setUsers = useChatStore((state) => state.setUsers);
  const setRooms = useChatStore((state) => state.setRooms);
  const router = useRouter();
  
  // Initialize socket connection
  useSocket();

  useEffect(() => {
    const bootstrapApp = async () => {
      try {
        // Parallelize EVERYTHING: Auth + Sidebar Data
        const [authRes, usersRes, roomsRes] = await Promise.all([
          fetchApi("/api/auth/me"),
          fetchApi("/api/users"),
          fetchApi("/api/rooms"),
        ]);

        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.user && authData.user.name) {
            setCurrentUser(authData.user);
          } else {
            router.push("/login");
            return;
          }
        } else {
          router.push("/login");
          return;
        }

        // Populate Sidebar data immediately to prevent waterfalls
        if (usersRes.ok && roomsRes.ok) {
          const [uData, rData] = await Promise.all([usersRes.json(), roomsRes.json()]);
          
          // API returns objects like { users: [...] } or { rooms: [...] }
          // We extract the arrays to prevent "filter is not a function" errors
          setUsers(uData.users || uData || []);
          setRooms(rData.rooms || rData || []);
        }
      } catch (error) {
        console.error("Bootstrap failed", error);
        router.push("/login");
      }
    };

    bootstrapApp();
  }, [setCurrentUser, setUsers, setRooms, router]);

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      <div className="hidden md:block animate-in slide-in-from-left-4 duration-300">
        <Sidebar />
      </div>

      <main className="flex-1 relative flex flex-col min-w-0">
        <div className="flex-1 flex flex-col min-w-0 animate-in fade-in duration-300">
          {children}
        </div>
      </main>
    </div>
  );
}

