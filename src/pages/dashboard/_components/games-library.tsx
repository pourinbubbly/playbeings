import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Clock } from "lucide-react";

export function GamesLibrary() {
  const games = useQuery(api.profiles.getUserGames);

  if (games === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedGames = [...games].sort((a, b) => b.playtime - a.playtime).slice(0, 12);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Games</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedGames.map((game) => (
            <div
              key={game._id}
              className="bg-card border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="aspect-video bg-muted flex items-center justify-center">
                <img
                  src={game.imageUrl}
                  alt={game.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold line-clamp-1">{game.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{Math.floor(game.playtime / 60)} hrs</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
