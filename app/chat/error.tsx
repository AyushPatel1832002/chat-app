"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0f172a] text-center">
      <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-slate-400 max-w-md mb-8">
        We encountered an error while trying to load your chat. This might be due to a connection issue.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all shadow-lg shadow-primary/20"
      >
        <RefreshCcw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
