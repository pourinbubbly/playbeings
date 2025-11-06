import { Authenticated, AuthLoading } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
import { Gamepad2, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";

export default function Games() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <GamesContent />
      </Authenticated>
    </>
  );
}

function GamesContent() {
  const games = useQuery(api.profiles.getUserGames);

  if (games === undefined) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (games.length === 0) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="pt-6">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Gamepad2 />
                </EmptyMedia>
                <EmptyTitle>No games found</EmptyTitle>
                <EmptyDescription>
                  Connect your Steam account to see your game library
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const sortedGames = [...games].sort((a, b) => b.playtime - a.playtime);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Game Library</CardTitle>
            <CardDescription>
              Your complete Steam game collection
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedGames.map((game) => (
            <Card key={game._id} className="overflow-hidden hover:border-primary/50 transition-colors">
              <div className="aspect-video bg-muted relative">
                <img
                  src={game.imageUrl}
                  alt={game.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <CardContent className="pt-4 space-y-3">
                <h3 className="font-semibold line-clamp-1">{game.name}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(game.playtime / 60)} hours played</span>
                  </div>
                  
                  {game.lastPlayed && game.lastPlayed > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Last played: {new Date(game.lastPlayed * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {game.playtime > 6000 && (
                  <Badge variant="secondary" className="w-full justify-center">
                    100+ Hours
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
