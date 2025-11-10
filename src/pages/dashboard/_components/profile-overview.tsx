import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Clock, Gamepad2, Trophy, Star, Flame, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ProfileOverviewProps {
  profile: Doc<"steamProfiles">;
  user: Doc<"users"> | null;
}

export function ProfileOverview({ profile, user }: ProfileOverviewProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const syncSteamData = useAction(api.steam.syncSteamData);
  const saveSteamProfile = useMutation(api.profiles.saveSteamProfile);
  const saveGames = useMutation(api.profiles.saveGames);

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours >= 1000) {
      const thousands = (hours / 1000).toFixed(1);
      return `${thousands}k hrs`;
    }
    return `${hours} hrs`;
  };

  const formatLastSync = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const handleSync = async () => {
    if (!profile.steamId) {
      toast.error("Steam ID not found");
      return;
    }

    setIsSyncing(true);
    try {
      toast.info("Syncing Steam data...");
      
      // Sync Steam data
      const data = await syncSteamData({ steamId: profile.steamId });
      
      // Save Steam profile
      await saveSteamProfile({
        steamId: data.steamId,
        personaName: data.personaName,
        avatarUrl: data.avatarUrl,
        profileUrl: data.profileUrl,
        totalPlaytime: data.totalPlaytime,
        gameCount: data.gameCount,
        achievementCount: data.achievementCount,
      });
      
      // Save games
      await saveGames({ games: data.games });
      
      toast.success("Steam data synced successfully!");
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Failed to sync Steam data");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="glass-card rounded-lg border border-[var(--neon-cyan)]/20 p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Avatar & Name */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-28 h-28 border-2 border-[var(--neon-cyan)]/40">
              <AvatarImage src={user?.avatar || profile.avatarUrl} alt={user?.username || profile.personaName} />
              <AvatarFallback className="text-3xl">{(user?.username || profile.personaName)[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full border border-[var(--neon-cyan)] bg-black flex items-center justify-center">
              <span className="text-sm font-bold text-[var(--neon-cyan)]">{user?.level || 1}</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl font-bold gradient-text-cyber tracking-wide">{user?.username || profile.personaName}</h2>
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                size="sm"
                className="bg-black/20 border border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 font-semibold uppercase tracking-wider"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync"}
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-[var(--neon-purple)]/10 border border-[var(--neon-purple)] text-[var(--neon-purple)] font-bold uppercase tracking-wider">
                <Star className="w-4 h-4 mr-2" />
                {user?.totalPoints || 0} POINTS
              </Badge>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Last sync: {formatLastSync(profile.lastSynced)}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<Gamepad2 className="w-5 h-5" />}
            label="GAMES"
            value={profile.gameCount.toString()}
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="PLAYTIME"
            value={formatPlaytime(profile.totalPlaytime)}
          />
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            label="TROPHIES"
            value={profile.achievementCount.toString()}
          />
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="STREAK"
            value={`${user?.currentStreak || 0} Days`}
            highlight={true}
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
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-black/20 rounded-lg border p-4 flex flex-col gap-2 transition-all ${
      highlight 
        ? "border-[var(--neon-purple)]/20 hover:border-[var(--neon-purple)]/40" 
        : "border-[var(--neon-magenta)]/10 hover:border-[var(--neon-magenta)]/30"
    }`}>
      <div className={`flex items-center gap-1.5 font-semibold uppercase tracking-wider text-xs ${
        highlight ? "text-[var(--neon-purple)]" : "text-[var(--neon-magenta)]"
      }`}>
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-2xl lg:text-3xl font-bold text-foreground truncate" title={value}>{value}</div>
    </div>
  );
}
