import { Card, CardContent } from "@/components/ui/card.tsx";
import { CheckCircle2, Target, TrendingUp } from "lucide-react";

interface QuestStatsProps {
  stats: {
    todayCompleted: number;
    todayTotal: number;
    totalCompleted: number;
  } | null;
}

export function QuestStats({ stats }: QuestStatsProps) {
  if (!stats) {
    return null;
  }

  const todayPercentage = stats.todayTotal > 0
    ? Math.round((stats.todayCompleted / stats.todayTotal) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        icon={<Target className="w-5 h-5" />}
        label="Today's Progress"
        value={`${stats.todayCompleted}/${stats.todayTotal}`}
        subtitle={`${todayPercentage}% complete`}
      />
      <StatCard
        icon={<CheckCircle2 className="w-5 h-5" />}
        label="Completed Today"
        value={stats.todayCompleted.toString()}
        subtitle="Quests finished"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Total Completed"
        value={stats.totalCompleted.toString()}
        subtitle="All time"
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
