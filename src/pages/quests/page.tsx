import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { QuestCard } from "./_components/quest-card.tsx";
import { QuestStats } from "./_components/quest-stats.tsx";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
import { Target } from "lucide-react";
import { UnauthenticatedPage } from "@/components/ui/unauthenticated-page.tsx";

export default function Quests() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <QuestsContent />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedPage />
      </Unauthenticated>
    </>
  );
}

function QuestsContent() {
  const initQuests = useMutation(api.initQuests.initializeTodayQuests);
  const syncProgress = useMutation(api.quests.syncQuestProgress);
  const syncAchievements = useAction(api.quests.syncAchievements);
  const questsData = useQuery(api.quests.getTodayQuests);
  const questStats = useQuery(api.quests.getUserQuestStats);

  useEffect(() => {
    const init = async () => {
      await initQuests();
      // First sync Steam achievements
      await syncAchievements();
      // Then sync quest progress
      await syncProgress();
    };
    init();
  }, [initQuests, syncProgress, syncAchievements]);

  if (questsData === undefined || questStats === undefined) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!questsData || !questsData.quests || questsData.quests.length === 0) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Target />
                </EmptyMedia>
                <EmptyTitle>No quests available today</EmptyTitle>
                <EmptyDescription>
                  Check back tomorrow for new daily quests!
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const progressMap = new Map(
    questsData.userProgress.map((p: { questId: string; progress: number; completed: boolean; claimed: boolean }) => [p.questId, p])
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Quests</CardTitle>
            <CardDescription>
              Complete quests by playing your Steam games to earn points and climb the leaderboard
            </CardDescription>
          </CardHeader>
        </Card>

        <QuestStats stats={questStats} />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {questsData.quests.map((quest: { id: string; type: string; title: string; description: string; requirement: number; reward: number; icon: string }) => {
            const userProgress = progressMap.get(quest.id) as { progress: number; completed: boolean; claimed: boolean } | undefined;
            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                progress={userProgress?.progress || 0}
                completed={userProgress?.completed || false}
                claimed={userProgress?.claimed || false}
              />
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
