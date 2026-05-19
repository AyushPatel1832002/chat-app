import { memo } from "react";

const Skeleton = memo(({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
));

Skeleton.displayName = "Skeleton";

export const SidebarSkeleton = () => (
  <div className="space-y-4 p-4">
    {Array(8).fill(0).map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <Skeleton className="w-12 h-12 flex-shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const ChatWindowSkeleton = () => (
  <div className="flex flex-col h-full bg-slate-950/30">
    {/* Header Skeleton */}
    <div className="p-6 border-b border-white/5 flex items-center space-x-4">
      <Skeleton className="w-12 h-12 rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>

    {/* Messages Skeleton */}
    <div className="flex-1 p-6 space-y-6 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
          <div className={`flex items-end space-x-2 max-w-[70%] ${i % 2 === 0 ? "" : "flex-row-reverse space-x-reverse"}`}>
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <Skeleton className={`h-16 w-48 rounded-2xl ${i % 2 === 0 ? "rounded-bl-none" : "rounded-br-none"}`} />
          </div>
        </div>
      ))}
    </div>

    {/* Input Skeleton */}
    <div className="p-6 border-t border-white/5">
      <Skeleton className="h-14 w-full rounded-2xl" />
    </div>
  </div>
);

export default Skeleton;
