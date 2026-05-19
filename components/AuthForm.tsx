"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/useChatStore";
import { fetchApi } from "@/lib/api";
import { motion } from "framer-motion";
import { User, Mail, Lock, Loader2 } from "lucide-react";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { setCurrentUser } = useChatStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetchApi(endpoint, {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        // Set first-party cookie for Next.js middleware
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure`;
      }

      setCurrentUser(data.user);
      router.push("/chat");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full relative z-10">
      {mode === "register" && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Name</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.05] outline-none transition-all text-white placeholder:text-slate-600 backdrop-blur-sm"
              placeholder="John Doe"
              required
            />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
        <div className="relative group">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.05] outline-none transition-all text-white placeholder:text-slate-600 backdrop-blur-sm"
            placeholder="email@example.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
          {mode === "login" && (
            <button type="button" className="text-[10px] font-bold text-primary hover:text-indigo-400 transition-colors uppercase tracking-wider">
              Forgot?
            </button>
          )}
        </div>
        <div className="relative group">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/5 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.05] outline-none transition-all text-white placeholder:text-slate-600 backdrop-blur-sm"
            placeholder="••••••••"
            required
          />
        </div>
      </div>

      {error && (
        <div 
          className="text-sm text-red-400 bg-red-400/10 p-4 rounded-2xl border border-red-400/20 flex items-start space-x-3 animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-primary hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/30 flex items-center justify-center space-x-2 active:scale-[0.98]"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
        )}
      </button>
    </form>
  );
}
