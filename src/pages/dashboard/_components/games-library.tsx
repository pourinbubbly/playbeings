import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button.tsx";

export function GamesLibrary() {
  const games = useQuery(api.profiles.getUserGames, {});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, [games]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (games === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 min-w-[180px] flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  const sortedGames = [...games].sort((a, b) => b.playtime - a.playtime).slice(0, 12);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text-purple uppercase tracking-wider">
          Top Games
        </h2>
        <Link 
          to="/dashboard/games" 
          className="flex items-center gap-2 text-[var(--neon-cyan)] font-semibold uppercase tracking-wide text-sm hover:text-[var(--neon-magenta)] transition-colors"
        >
          See All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal Scrolling Games */}
      <div className="relative -mx-6 px-6">
        {/* Left Scroll Button */}
        {showLeftButton && (
          <Button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 glass-card border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 w-10 h-10 p-0 rounded-full neon-glow-cyan"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}

        {/* Right Scroll Button */}
        {showRightButton && (
          <Button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 glass-card border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 w-10 h-10 p-0 rounded-full neon-glow-cyan"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}

        <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-custom">
          {sortedGames.map((game) => (
            <div
              key={game._id}
              className="glass-card rounded-sm border-2 border-[var(--neon-purple)]/20 overflow-hidden hover-glow-purple transition-all group min-w-[200px] flex-shrink-0"
            >
              <div className="aspect-[616/353] bg-black/40 relative overflow-hidden">
                <img
                  src={game.imageUrl}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1">
                  <h3 className="font-bold line-clamp-1 text-xs uppercase tracking-wide">
                    {game.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--neon-cyan)] font-semibold">
                    <Clock className="w-3 h-3" />
                    <span>{Math.floor(game.playtime / 60)}h</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
