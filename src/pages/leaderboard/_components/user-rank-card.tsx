import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { TrendingUp, Star } from "lucide-react";

interface UserRank {
  rank: number;
  userId: Id<"users">;
  name: string;
  avatar: string;
  points: number;
  level: number;
}

interface UserRankCardProps {
  userRank: UserRank;
}

export function UserRankCard({ userRank }: UserRankCardProps) {
  return (
    <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar & Info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 ring-2 ring-primary">
              <AvatarImage src={userRank.avatar} alt={userRank.name} />
              <AvatarFallback>{userRank.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-bold">{userRank.name}</h3>
              <p className="text-muted-foreground">Level {userRank.level}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-2 gap-4 w-full md:w-auto">
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Your Rank"
              value={`#${userRank.rank}`}
            />
            <StatCard
              icon={<Star className="w-5 h-5" />}
              label="Total Points"
              value={userRank.points.toLocaleString()}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-background rounded-lg p-4 space-y-2 border">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
