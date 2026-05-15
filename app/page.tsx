import Link from "next/link";
import { MessageSquare, Shield, Zap, Globe } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-blue-500/10 rounded-full blur-[128px]" />

      <div className="z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-medium text-slate-300">v1.0 is now live</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Connect with <span className="text-gradient">Aura</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          A high-performance, real-time chat experience built for the modern web. 
          Experience seamless communication with sub-second latency.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/chat"
            className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-primary/20"
          >
            Start Chatting
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 glass hover:bg-white/10 text-white rounded-xl font-semibold transition-all"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          <FeatureCard 
            icon={<Zap className="w-5 h-5 text-yellow-400" />}
            title="Ultra Fast"
            desc="Socket.IO powered real-time updates."
          />
          <FeatureCard 
            icon={<Shield className="w-5 h-5 text-green-400" />}
            title="Secure"
            desc="JWT authentication and encrypted transport."
          />
          <FeatureCard 
            icon={<Globe className="w-5 h-5 text-blue-400" />}
            title="Edge Ready"
            desc="Optimized for low-latency edge delivery."
          />
          <FeatureCard 
            icon={<MessageSquare className="w-5 h-5 text-purple-400" />}
            title="Rooms"
            desc="Organize conversations into private rooms."
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl glass-dark hover:border-white/20 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400">{desc}</p>
    </div>
  );
}
     