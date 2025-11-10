import { useState } from "react";
import { Authenticated, AuthLoading } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
import { Gamepad2, Clock, Calendar, ExternalLink, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";

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
  const games = useQuery(api.profiles.getUserGames, {});
  const [selectedGame, setSelectedGame] = useState<Doc<"games"> | null>(null);

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
      <div className="space-y-8">
        {/* Header */}
        <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 neon-glow-cyan">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-black/40 border-2 border-[var(--neon-cyan)] flex items-center justify-center neon-glow-cyan">
              <Gamepad2 className="w-8 h-8 text-[var(--neon-cyan)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text-cyber tracking-wider uppercase">
                Game Library
              </h1>
              <p className="text-muted-foreground text-sm uppercase tracking-wide mt-1">
                Your complete Steam collection
              </p>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedGames.map((game) => (
            <div 
              key={game._id} 
              className="glass-card rounded-sm border-2 border-[var(--neon-purple)]/20 overflow-hidden hover-glow-purple transition-all group cursor-pointer"
              onClick={() => setSelectedGame(game)}
            >
              <div className="aspect-[616/353] bg-black/40 relative overflow-hidden border-b-2 border-[var(--neon-purple)]/20">
                <img
                  src={game.imageUrl}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                {game.playtime > 6000 && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-[var(--neon-cyan)]/20 border border-[var(--neon-cyan)] text-[var(--neon-cyan)] font-semibold uppercase tracking-wider text-xs">
                      100+ Hours
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="p-4 space-y-3">
                <h3 className="font-bold line-clamp-1 text-foreground uppercase tracking-wide text-sm">
                  {game.name}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--neon-cyan)] font-semibold uppercase tracking-wide">
                    <Clock className="w-4 h-4" />
                    <span>{Math.floor(game.playtime / 60)}h played</span>
                  </div>
                  
                  {game.lastPlayed && game.lastPlayed > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(game.lastPlayed * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Game Detail Modal */}
        {selectedGame && (
          <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
            <DialogContent className="glass-card border-2 border-[var(--neon-cyan)]/30 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold gradient-text-cyber uppercase tracking-wider">
                  {selectedGame.name}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground uppercase tracking-wide">
                  Steam App ID: {selectedGame.appId}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Game Image */}
                <div className="aspect-[616/353] bg-black/40 relative overflow-hidden rounded border-2 border-[var(--neon-purple)]/20">
                  <img
                    src={selectedGame.imageUrl}
                    alt={selectedGame.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4 border border-[var(--neon-cyan)]/20">
                    <div className="flex items-center gap-2 text-[var(--neon-cyan)] mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-wide font-semibold">Playtime</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.floor(selectedGame.playtime / 60)}h {selectedGame.playtime % 60}m
                    </p>
                  </div>

                  <div className="glass-card p-4 border border-[var(--neon-magenta)]/20">
                    <div className="flex items-center gap-2 text-[var(--neon-magenta)] mb-2">
                      <Calendar className="w-5 h-5" />
                      <span className="text-sm uppercase tracking-wide font-semibold">Last Played</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {selectedGame.lastPlayed && selectedGame.lastPlayed > 0
                        ? new Date(selectedGame.lastPlayed * 1000).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : "Never"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => window.open(`https://store.steampowered.com/app/${selectedGame.appId}`, '_blank')}
                    className="flex-1 glass-card border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 hover:neon-glow-cyan font-bold uppercase tracking-wider"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Steam
                  </Button>

                  <Button
                    onClick={() => window.open(`steam://rungameid/${selectedGame.appId}`, '_self')}
                    className="flex-1 glass-card border-2 border-[var(--neon-magenta)] text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/10 hover:neon-glow-magenta font-bold uppercase tracking-wider"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Game
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
