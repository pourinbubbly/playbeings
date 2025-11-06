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
  const steamProfile = useQuery(api.profiles.getSteamProfile);
  const games = useQuery(api.profiles.getUserGames);

  if (games === undefined || steamProfile === undefined) {
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

  if (!steamProfile || games.length === 0) {
    return (
      <DashboardLayout>
        <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 text-center space-y-4">
          <Gamepad2 className="w-16 h-16 text-[var(--neon-cyan)] mx-auto opacity-50" />
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-2">Steam hesabınızı bağlayın</h2>
            <p className="text-muted-foreground uppercase tracking-wide">
              Oyun kütüphanenizi görmek için Steam hesabınızı bağlamanız gerekiyor
            </p>
          </div>
        </div>
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
              className="glass-card rounded-sm border-2 border-[var(--neon-purple)]/20 overflow-hidden hover-glow-purple transition-all group"
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
      </div>
    </DashboardLayout>
  );
}
