import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp } from "lucide-react";

interface PointsChartProps {
  data: Array<{
    date: string;
    points: number;
  }>;
}

export function PointsChart({ data }: PointsChartProps) {
  // Calculate cumulative points
  let cumulative = 0;
  const cumulativeData = data.map((item) => {
    cumulative += item.points;
    return {
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      totalPoints: cumulative,
    };
  });

  const maxPoints = Math.max(...cumulativeData.map((d) => d.totalPoints));
  const minPoints = Math.min(...cumulativeData.map((d) => d.totalPoints));
  const pointsGain = maxPoints - minPoints;
  const percentageGain = minPoints > 0 ? ((pointsGain / minPoints) * 100).toFixed(1) : "0.0";

  return (
    <Card className="glass-card border-2 border-[var(--neon-cyan)]/30 neon-glow-cyan">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold gradient-text-cyber uppercase tracking-wider flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-[var(--neon-cyan)]" />
              Points Growth
            </CardTitle>
            <CardDescription className="uppercase tracking-wide mt-2">
              Cumulative point growth over the last 30 days
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[var(--neon-cyan)]">
              {maxPoints.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              <span className="text-[var(--neon-magenta)] font-semibold">+{percentageGain}%</span> this month
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativeData}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--neon-cyan)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--neon-cyan)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--neon-cyan)" 
                opacity={0.1}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                stroke="var(--neon-cyan)"
                strokeOpacity={0.2}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                stroke="var(--neon-cyan)"
                strokeOpacity={0.2}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "2px solid var(--neon-cyan)",
                  borderRadius: "8px",
                  boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)",
                }}
                labelStyle={{ 
                  color: "hsl(var(--foreground))",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [
                  <span key="value" className="text-[var(--neon-cyan)] font-bold">{value.toLocaleString()} PTS</span>, 
                  "Total Points"
                ]}
              />
              <Area
                type="monotone"
                dataKey="totalPoints"
                stroke="var(--neon-cyan)"
                strokeWidth={3}
                fill="url(#colorPoints)"
                dot={{ 
                  fill: "var(--neon-cyan)", 
                  stroke: "hsl(var(--background))", 
                  strokeWidth: 2,
                  r: 4 
                }}
                activeDot={{ 
                  r: 7,
                  fill: "var(--neon-cyan)",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 3,
                  filter: "drop-shadow(0 0 6px var(--neon-cyan))"
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
