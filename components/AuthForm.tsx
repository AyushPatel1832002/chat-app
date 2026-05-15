"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/useChatStore";
import { fetchApi } from "@/lib/api";

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

      setCurrentUser(data.user);
      router.push("/chat");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      {mode === "register" && (
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="John Doe"
            required
          />
        </div>
      )}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
          placeholder="email@example.com"
          required
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
          placeholder="••••••••"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
      >
        {loading ? "Processing..." : mode === "login" ? "Sign In" : "Create Account"}
      </button>
    </form>
  );
}
