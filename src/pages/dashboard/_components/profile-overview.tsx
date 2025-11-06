import type { Doc } from "@/convex/_generated/dataModel.d.ts";
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
    <div className="glass-card rounded-sm border-2 border-[var(--neon-cyan)]/20 neon-glow-cyan p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Avatar & Name */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-[var(--neon-cyan)]/40">
              <AvatarImage src={profile.avatarUrl} alt={profile.personaName} />
              <AvatarFallback className="text-3xl">{profile.personaName[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full border-2 border-[var(--neon-cyan)] bg-black/80 flex items-center justify-center neon-glow-cyan">
              <span className="text-sm font-bold text-[var(--neon-cyan)]">{user?.level || 1}</span>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold gradient-text-cyber tracking-wide mb-2">{profile.personaName}</h2>
            <Badge className="bg-[var(--neon-purple)]/20 border-2 border-[var(--neon-purple)] text-[var(--neon-purple)] font-bold uppercase tracking-wider neon-glow-purple">
              <Star className="w-4 h-4 mr-2" />
              {user?.totalPoints || 0} POINTS
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Gamepad2 className="w-6 h-6" />}
            label="GAMES"
            value={profile.gameCount.toString()}
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="PLAYTIME"
            value={formatPlaytime(profile.totalPlaytime)}
          />
          <StatCard
            icon={<Trophy className="w-6 h-6" />}
            label="TROPHIES"
            value={profile.achievementCount.toString()}
          />
        </div>
      </div>
    </div>
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
    <div className="glass-card rounded-sm border-2 border-[var(--neon-magenta)]/20 p-5 space-y-3 hover-glow-magenta transition-all">
      <div className="flex items-center gap-2 text-[var(--neon-magenta)] font-semibold uppercase tracking-wider text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}
