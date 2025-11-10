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
import { Trophy, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";

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

  // Calculate days remaining in current month
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = Math.ceil((endOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

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
        {/* Prize Pool Banner */}
        <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border border-yellow-500/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-red-500/5" />
          <CardHeader className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Monthly Prize Pool</CardTitle>
                  <CardDescription className="text-base">
                    Top 100 players share $1,000 USD
                  </CardDescription>
                </div>
              </div>
              <div className="text-left md:text-right">
                <div className="flex items-center gap-2 text-3xl font-bold text-yellow-600 dark:text-yellow-500">
                  <DollarSign className="w-8 h-8" />
                  1,000
                </div>
                <Badge variant="secondary" className="mt-2">
                  Ends in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Leaderboard Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Global Leaderboard
            </CardTitle>
            <CardDescription>
              Compete with players worldwide and climb to the top
            </CardDescription>
          </CardHeader>
        </Card>

        {currentUserRank && <UserRankCard userRank={currentUserRank} />}

        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="leaderboard">
              Top Players
            </TabsTrigger>
            <TabsTrigger value="history">
              Point History
            </TabsTrigger>
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
