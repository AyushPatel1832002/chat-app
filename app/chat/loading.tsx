export default function ChatLoading() {
  return (
    <div className="flex h-screen bg-[#0f172a]">
      {/* Sidebar Skeleton */}
      <aside className="w-80 border-r border-white/5 bg-black/20 backdrop-blur-xl hidden md:block">
        <div className="p-6 border-b border-white/5">
          <div className="h-6 w-24 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/5 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
                <div className="h-2 bg-white/5 rounded w-3/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </aside>
      
      {/* Main Content Skeleton */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );
}
