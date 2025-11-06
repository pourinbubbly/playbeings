import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Target, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress.tsx";

// Quest icon to image mapping - Her quest için farklı resim
const questIconImages: Record<string, string> = {
  "🎯": "https://images.unsplash.com/photo-1660211983492-9df0c82ba9ae?w=400&h=300&fit=crop",
  "🎮": "https://images.unsplash.com/photo-1709708458773-348597b3d5b9?w=400&h=300&fit=crop",
  "🏆": "https://images.unsplash.com/photo-1650089603011-a1d7a512430a?w=400&h=300&fit=crop",
  "⚔️": "https://images.unsplash.com/photo-1577905027671-c5cc33c825ed?w=400&h=300&fit=crop",
  "🎪": "https://images.unsplash.com/flagged/photo-1580234820596-0876d136e6d5?w=400&h=300&fit=crop",
  "🔒": "https://images.unsplash.com/photo-1696013910376-c56f76dd8178?w=400&h=300&fit=crop",
  "⭐": "https://images.unsplash.com/photo-1705925716592-259267037a03?w=400&h=300&fit=crop",
  "💎": "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=400&h=300&fit=crop",
  "🔥": "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=400&h=300&fit=crop",
  "⚡": "https://images.unsplash.com/photo-1554213352-5ffe6534af08?w=400&h=300&fit=crop",
};

export function DailyQuestsSection() {
  const questsData = useQuery(api.quests.getTodayQuests);

  if (questsData === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 min-w-[280px] flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!questsData || !questsData.quests || questsData.quests.length === 0) {
    return null;
  }

  const progressMap = new Map(
    questsData.userProgress.map((p: { questId: string; progress: number; completed: boolean; claimed: boolean }) => [p.questId, p])
  );

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text-purple uppercase tracking-wider">
          Daily Quests
        </h2>
        <Link 
          to="/dashboard/quests" 
          className="flex items-center gap-2 text-[var(--neon-cyan)] font-semibold uppercase tracking-wide text-sm hover:text-[var(--neon-magenta)] transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal Scrolling Quests */}
      <div className="relative -mx-6 px-6">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-custom">
          {questsData.quests.slice(0, 5).map((quest: { id: string; type: string; title: string; description: string; requirement: number; reward: number; icon: string }) => {
            const userProgress = progressMap.get(quest.id) as { progress: number; completed: boolean; claimed: boolean } | undefined;
            const progress = userProgress?.progress || 0;
            const completed = userProgress?.completed || false;
            const progressPercentage = Math.min((progress / quest.requirement) * 100, 100);

            return (
              <div
                key={quest.id}
                className="glass-card rounded-sm border-2 border-[var(--neon-cyan)]/20 overflow-hidden min-w-[300px] max-w-[320px] flex-shrink-0 hover-glow-cyan transition-all"
              >
                {/* Quest Image */}
                <div className="relative h-32 bg-black/40 overflow-hidden">
                  <img 
                    src={questIconImages[quest.icon] || questIconImages["🎯"]}
                    alt={quest.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  {completed && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-sm bg-[var(--neon-cyan)] text-black text-xs font-bold uppercase neon-glow-cyan">
                      ✓ COMPLETE
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-sm uppercase tracking-wide truncate text-white">
                      {quest.title}
                    </h3>
                    <p className="text-xs text-[var(--neon-cyan)] uppercase tracking-wide font-semibold mt-1">
                      +{quest.reward} PTS
                    </p>
                  </div>
                </div>
                
                {/* Quest Progress */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-[var(--neon-cyan)]">
                      {progress}/{quest.requirement}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
