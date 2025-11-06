import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Clock } from "lucide-react";

interface RecentActivityProps {
  games: Array<{
    name: string;
    playtime: number;
    lastPlayed: number;
    imageUrl: string;
  }>;
}

export function RecentActivity({ games }: RecentActivityProps) {
  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours.toLocaleString()}h played`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your recently played games</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {games.map((game, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                <img
                  src={game.imageUrl}
                  alt={game.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{game.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {formatPlaytime(game.playtime)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatDate(game.lastPlayed)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
