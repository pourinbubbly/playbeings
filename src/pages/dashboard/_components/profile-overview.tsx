import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Clock, Gamepad2, Trophy, Star } from "lucide-react";

interface ProfileOverviewProps {
  profile: Doc<"steamProfiles">;
  user: Doc<"users"> | null;
}

export function ProfileOverview({ profile, user }: ProfileOverviewProps) {
  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    return `${hours.toLocaleString()} hrs`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatarUrl} alt={profile.personaName} />
              <AvatarFallback>{profile.personaName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile.personaName}</h2>
              <p className="text-muted-foreground">Level {user?.level || 1}</p>
              <Badge className="mt-2">
                <Star className="w-3 h-3 mr-1" />
                {user?.totalPoints || 0} Points
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={<Gamepad2 className="w-5 h-5" />}
              label="Games Owned"
              value={profile.gameCount.toString()}
            />
            <StatCard
              icon={<Clock className="w-5 h-5" />}
              label="Total Playtime"
              value={formatPlaytime(profile.totalPlaytime)}
            />
            <StatCard
              icon={<Trophy className="w-5 h-5" />}
              label="Achievements"
              value={profile.achievementCount.toString()}
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
    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
