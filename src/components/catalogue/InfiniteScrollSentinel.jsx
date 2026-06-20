export default function InfiniteScrollSentinel({
  sentinelRef,
  hasMore,
  isLoadingMore,
  activeLayout
}) {
  
  // Magazine Skeleton (Pattern A)
  const renderMagazineSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch animate-pulse">
      {/* Featured block (60%) */}
      <div className="lg:col-span-6 aspect-[3/4] bg-primary-soft/10 rounded-3xl" />
      {/* 2 compact blocks (40%) */}
      <div className="lg:col-span-4 grid grid-cols-2 gap-4">
        <div className="aspect-[3/4] bg-primary-soft/10 rounded-2xl" />
        <div className="aspect-[3/4] bg-primary-soft/10 rounded-2xl" />
      </div>
    </div>
  );

  // Grid Skeleton (4 cards)
  const renderGridSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((idx) => (
        <div key={idx} className="aspect-[2/3] bg-primary-soft/10 rounded-2xl space-y-4 p-4 flex flex-col justify-end">
          <div className="h-4 bg-primary-soft/20 rounded w-3/4" />
          <div className="h-3 bg-primary-soft/20 rounded w-1/2" />
        </div>
      ))}
    </div>
  );

  // List Skeleton (3 rows)
  const renderListSkeleton = () => (
    <div className="flex flex-col bg-white rounded-3xl border border-primary-soft/10 overflow-hidden divide-y divide-primary-soft/5 animate-pulse">
      {[1, 2, 3].map((idx) => (
        <div key={idx} className="flex p-4 gap-4 items-center">
          <div className="w-20 h-28 bg-primary-soft/10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-primary-soft/10 rounded w-1/3" />
            <div className="h-3 bg-primary-soft/10 rounded w-1/4" />
            <div className="h-3 bg-primary-soft/10 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full space-y-6 pt-12 pb-16 select-none">
      {/* 1. Skeletons */}
      {isLoadingMore && (
        <div className="w-full">
          {activeLayout === "magazine" && renderMagazineSkeleton()}
          {activeLayout === "grid" && renderGridSkeleton()}
          {activeLayout === "list" && renderListSkeleton()}
        </div>
      )}

      {/* 2. Sentinel trigger target */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="h-20 w-full flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          {/* Subtle loading spinner inside sentinel if it is actively intersections */}
          {!isLoadingMore && (
            <div className="w-6 h-6 border-2 border-[#1c380e]/20 border-t-[#1c380e] rounded-full animate-spin" />
          )}
        </div>
      )}

      {/* 3. Bottom final page text */}
      {!hasMore && (
        <div className="py-8 text-center text-xs md:text-sm font-serif italic text-gray/60 border-t border-primary-soft/5">
          — Vous avez vu tous les livres disponibles —
        </div>
      )}

    </div>
  );
}
