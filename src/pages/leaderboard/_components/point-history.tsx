import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Plus } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
import { TrendingUp } from "lucide-react";

interface PointHistoryProps {
  history: Doc<"pointHistory">[];
}

export function PointHistory({ history }: PointHistoryProps) {
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TrendingUp />
              </EmptyMedia>
              <EmptyTitle>No point history yet</EmptyTitle>
              <EmptyDescription>
                Complete quests to start earning points
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {history.map((entry) => {
            const date = new Date(entry.timestamp);
            const isPositive = entry.amount > 0;

            return (
              <div
                key={entry._id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{entry.reason}</div>
                  <div className="text-sm text-muted-foreground">
                    {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                  </div>
                </div>
                <Badge
                  variant={isPositive ? "default" : "destructive"}
                  className="ml-4 flex items-center gap-1"
                >
                  {isPositive && <Plus className="w-3 h-3" />}
                  {entry.amount.toLocaleString()}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
