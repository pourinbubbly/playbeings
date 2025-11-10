import { useNavigate } from "react-router-dom";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Crown, Medal, Star } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { CarvBadge } from "@/components/carv-badge.tsx";

interface LeaderboardEntry {
  rank: number;
  userId: Id<"users">;
  name: string;
  avatar: string;
  points: number;
  level: number;
  hasPremiumPass?: boolean;
  carvId?: string | null;
  carvProfileUrl?: string | null;
  carvReputationScore?: number | null;
}

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  currentUserId?: Id<"users">;
}

export function LeaderboardTable({ leaderboard, currentUserId }: LeaderboardTableProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.userId === currentUserId;
            const isMedalist = entry.rank <= 3;

            return (
              <div
                key={entry.userId}
                className={cn(
                  "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                  isCurrentUser && "bg-primary/5 border-l-4 border-primary"
                )}
                onClick={() => {
                  if (isCurrentUser) {
                    navigate("/profile");
                  } else {
                    navigate(`/user/${entry.userId}`);
                  }
                }}
              >
                {/* Rank */}
                <div className="w-12 flex-shrink-0 text-center">
                  {entry.rank === 1 && (
                    <Crown className="w-6 h-6 text-yellow-500 mx-auto" />
                  )}
                  {entry.rank === 2 && (
                    <Medal className="w-6 h-6 text-gray-400 mx-auto" />
                  )}
                  {entry.rank === 3 && (
                    <Medal className="w-6 h-6 text-amber-700 mx-auto" />
                  )}
                  {entry.rank > 3 && (
                    <span className="text-2xl font-bold text-muted-foreground">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className={cn("w-12 h-12", isMedalist && "ring-2 ring-primary")}>
                    <AvatarImage src={entry.avatar} alt={entry.name} />
                    <AvatarFallback>{entry.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate flex items-center gap-2 flex-wrap">
                      {entry.name}
                      {isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                      {entry.carvId && entry.carvProfileUrl && (
                        <CarvBadge 
                          carvId={entry.carvId}
                          reputationScore={entry.carvReputationScore}
                          size="sm"
                          showReputation={false}
                        />
                      )}
                      {entry.hasPremiumPass && (
                        <Badge className="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-white text-xs font-bold uppercase tracking-wider px-2 py-0.5 neon-glow-cyan">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Level {entry.level}
                    </div>
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-xl font-bold">{entry.points.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
