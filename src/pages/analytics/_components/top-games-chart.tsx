import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Progress } from "@/components/ui/progress.tsx";

interface TopGamesChartProps {
  topGames: Array<{
    name: string;
    playtime: number;
    percentage: number;
  }>;
}

export function TopGamesChart({ topGames }: TopGamesChartProps) {
  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours.toLocaleString()}h`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Games by Playtime</CardTitle>
        <CardDescription>Your most played games</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topGames.slice(0, 5).map((game, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate flex-1">{game.name}</span>
                <span className="text-muted-foreground ml-2">
                  {formatPlaytime(game.playtime)}
                </span>
              </div>
              <Progress value={game.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
