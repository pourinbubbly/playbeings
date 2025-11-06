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
        <Card className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 backdrop-blur-2xl border-2 border-yellow-500/30 glow-accent overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-red-500/10" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center glow-accent">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-black">Prize Pool</CardTitle>
                  <CardDescription className="text-lg">
                    Top 100 players share $1,000 USD!
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-4xl font-black text-yellow-500">
                  <DollarSign className="w-10 h-10" />
                  1,000
                </div>
                <Badge className="mt-2 bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                  Monthly Competition
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Leaderboard Header */}
        <Card className="bg-card/60 backdrop-blur-2xl border-2 border-primary/30 glow-primary">
          <CardHeader>
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Global Leaderboard
            </CardTitle>
            <CardDescription className="text-lg">
              Compete with players worldwide and climb to the top
            </CardDescription>
          </CardHeader>
        </Card>

        {currentUserRank && <UserRankCard userRank={currentUserRank} />}

        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card/60 backdrop-blur-2xl border border-primary/20">
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/30 data-[state=active]:to-accent/30">
              Top Players
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/30 data-[state=active]:to-accent/30">
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
