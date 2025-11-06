import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Target, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress.tsx";

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
                className="glass-card rounded-sm border-2 border-[var(--neon-cyan)]/20 p-5 min-w-[280px] flex-shrink-0 space-y-4 hover-glow-cyan transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-black/40 border-2 border-[var(--neon-cyan)] flex items-center justify-center text-2xl">
                      {quest.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-wide line-clamp-1">
                        {quest.title}
                      </h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        +{quest.reward} PTS
                      </p>
                    </div>
                  </div>
                  {completed && (
                    <div className="px-2 py-1 rounded-sm bg-[var(--neon-cyan)]/20 border border-[var(--neon-cyan)] text-[var(--neon-cyan)] text-xs font-bold uppercase">
                      ✓
                    </div>
                  )}
                </div>

                <div className="space-y-2">
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
