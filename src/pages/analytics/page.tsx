import { Authenticated, AuthLoading } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { OverviewStats } from "./_components/overview-stats.tsx";
import { TopGamesChart } from "./_components/top-games-chart.tsx";
import { PlaytimeDistribution } from "./_components/playtime-distribution.tsx";
import { RecentActivity } from "./_components/recent-activity.tsx";
import { PointsChart } from "./_components/points-chart.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <AnalyticsContent />
      </Authenticated>
    </>
  );
}

function AnalyticsContent() {
  const gameAnalytics = useQuery(api.analytics.getGameAnalytics);
  const progressOverTime = useQuery(api.analytics.getProgressOverTime);
  const achievementStats = useQuery(api.analytics.getAchievementStats);
  const steamProfile = useQuery(api.profiles.getSteamProfile, {});

  if (
    gameAnalytics === undefined ||
    progressOverTime === undefined ||
    achievementStats === undefined ||
    steamProfile === undefined
  ) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!steamProfile || !gameAnalytics) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BarChart3 />
                </EmptyMedia>
                <EmptyTitle>No analytics available</EmptyTitle>
                <EmptyDescription>
                  Connect your Steam account to view your gaming analytics
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Steam Analytics</CardTitle>
            <CardDescription>
              Deep insights into your gaming habits and achievements
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Points Chart - Featured at top */}
        {progressOverTime && progressOverTime.length > 0 && (
          <div className="relative">
            <div className="absolute -top-3 left-6 px-3 py-1 glass-card border-2 border-[var(--neon-cyan)]/40 rounded-sm z-10">
              <span className="text-xs font-bold text-[var(--neon-cyan)] uppercase tracking-wider">Featured</span>
            </div>
            <PointsChart data={progressOverTime} />
          </div>
        )}

        <OverviewStats
          analytics={gameAnalytics}
          achievements={achievementStats}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <TopGamesChart topGames={gameAnalytics.topGames} />
          <PlaytimeDistribution distribution={gameAnalytics.playtimeRanges} />
        </div>

        {gameAnalytics.recentGames.length > 0 && (
          <RecentActivity games={gameAnalytics.recentGames} />
        )}
      </div>
    </DashboardLayout>
  );
}
