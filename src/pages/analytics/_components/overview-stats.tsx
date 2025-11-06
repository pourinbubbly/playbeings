import { Card, CardContent } from "@/components/ui/card.tsx";
import { Clock, Gamepad2, Trophy, TrendingUp } from "lucide-react";

interface OverviewStatsProps {
  analytics: {
    totalGames: number;
    totalPlaytime: number;
    averagePlaytime: number;
  };
  achievements: {
    totalAchievements: number;
    totalGames: number;
    averageAchievementsPerGame: number;
  } | null;
}

export function OverviewStats({ analytics, achievements }: OverviewStatsProps) {
  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours.toLocaleString()}h`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Gamepad2 className="w-5 h-5" />}
        label="Total Games"
        value={analytics.totalGames.toString()}
        color="text-blue-500"
      />
      <StatCard
        icon={<Clock className="w-5 h-5" />}
        label="Total Playtime"
        value={formatPlaytime(analytics.totalPlaytime)}
        color="text-green-500"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Avg. per Game"
        value={formatPlaytime(analytics.averagePlaytime)}
        color="text-purple-500"
      />
      <StatCard
        icon={<Trophy className="w-5 h-5" />}
        label="Achievements"
        value={achievements?.totalAchievements.toString() || "0"}
        color="text-orange-500"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`w-12 h-12 bg-muted rounded-lg flex items-center justify-center ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
