import { Authenticated, AuthLoading } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { LeaderboardTable } from "./_components/leaderboard-table.tsx";
import { UserRankCard } from "./_components/user-rank-card.tsx";
import { PointHistory } from "./_components/point-history.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";

export default function Leaderboard() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <LeaderboardContent />
      </Authenticated>
    </>
  );
}

function LeaderboardContent() {
  const leaderboard = useQuery(api.leaderboard.getLeaderboard, { limit: 100 });
  const currentUserRank = useQuery(api.leaderboard.getCurrentUserRank);
  const pointHistory = useQuery(api.leaderboard.getPointHistory, { limit: 20 });

  if (leaderboard === undefined || currentUserRank === undefined || pointHistory === undefined) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>
              Compete with players worldwide and climb to the top
            </CardDescription>
          </CardHeader>
        </Card>

        {currentUserRank && <UserRankCard userRank={currentUserRank} />}

        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leaderboard">Top Players</TabsTrigger>
            <TabsTrigger value="history">Point History</TabsTrigger>
          </TabsList>
          <TabsContent value="leaderboard" className="mt-6">
            <LeaderboardTable leaderboard={leaderboard} currentUserId={currentUserRank?.userId} />
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <PointHistory history={pointHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
