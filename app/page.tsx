"use client";

import Link from "next/link";
import { MessageSquare, Shield, Zap, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px] opacity-50" />
      <div className="absolute bottom-0 -right-4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[128px] opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[160px]" />

      <div className="z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-8 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">Aura v1.0 is now live</span>
        </motion.div>

        <motion.h1 
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[1.1]"
        >
          Connect with <br />
          <span className="text-gradient">Aura Chat</span>
        </motion.h1>

        <motion.p 
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-lg md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
        >
          A high-performance, real-time chat experience built for the modern web. 
          Experience seamless communication with sub-second latency and premium aesthetics.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24"
        >
          <Link
            href="/chat"
            className="group px-10 py-5 bg-primary hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-primary/40 flex items-center space-x-2"
          >
            <span>Start Chatting</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="px-10 py-5 glass hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10"
          >
            Sign In
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left"
        >
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
            title="Ultra Fast"
            desc="Socket.IO powered real-time updates with minimal latency."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-green-400" />}
            title="Secure"
            desc="JWT authentication and encrypted transport for your data."
          />
          <FeatureCard 
            icon={<Globe className="w-6 h-6 text-blue-400" />}
            title="Edge Ready"
            desc="Optimized for low-latency delivery across the globe."
          />
          <FeatureCard 
            icon={<MessageSquare className="w-6 h-6 text-purple-400" />}
            title="Smart Rooms"
            desc="Organize conversations into beautiful, private rooms."
          />
        </motion.div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      className="p-8 rounded-[2rem] glass-dark border border-white/[0.03] transition-all"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-100 mb-3">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed font-medium">{desc}</p>
    </motion.div>
  );
}
     