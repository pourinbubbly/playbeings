import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";

interface PlaytimeDistributionProps {
  distribution: Record<string, number>;
}

const COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
];

export function PlaytimeDistribution({ distribution }: PlaytimeDistributionProps) {
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Playtime Distribution</CardTitle>
        <CardDescription>Games grouped by hours played</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(distribution).map(([range, count], index) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={range} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{range}</span>
                  <span className="text-muted-foreground">
                    {count} {count === 1 ? "game" : "games"}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${COLORS[index % COLORS.length]} transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
