import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Loader2, Gamepad2 } from "lucide-react";
import { toast } from "sonner";

export function SteamConnect() {
  const [steamInput, setSteamInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const linkSteam = useAction(api.steam.linkSteamAccount);
  const saveSteamProfile = useMutation(api.profiles.saveSteamProfile);
  const saveGames = useMutation(api.profiles.saveGames);

  // Extract Steam ID from profile URL or return as-is if already an ID
  const extractSteamId = (input: string): string | null => {
    const trimmed = input.trim();
    
    // If it's already a numeric Steam ID (17 digits)
    if (/^\d{17}$/.test(trimmed)) {
      return trimmed;
    }
    
    // Extract from steamcommunity.com/profiles/[ID]
    const profileMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/);
    if (profileMatch) {
      return profileMatch[1];
    }
    
    // Extract from steamcommunity.com/id/[customURL] - this won't work directly
    // User needs to use their numeric ID or profile URL with numeric ID
    return null;
  };

  const handleConnect = async () => {
    if (!steamInput.trim()) {
      toast.error("Please enter your Steam profile URL or Steam ID");
      return;
    }

    const steamId = extractSteamId(steamInput);
    
    if (!steamId) {
      toast.error("Invalid Steam ID or profile URL", {
        description: "Please enter your numeric Steam ID (17 digits) or profile URL with numeric ID"
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await linkSteam({ steamId });
      
      // Save profile to database
      await saveSteamProfile({
        steamId: data.steamId,
        personaName: data.personaName,
        avatarUrl: data.avatarUrl,
        profileUrl: data.profileUrl,
        totalPlaytime: data.totalPlaytime,
        gameCount: data.gameCount,
        achievementCount: data.achievementCount,
      });

      // Save games to database
      await saveGames({ games: data.games });

      toast.success("Steam account connected successfully!", {
        description: `Welcome ${data.personaName}!`
      });
      window.location.reload();
    } catch (error) {
      toast.error("Failed to connect Steam account", {
        description: error instanceof Error ? error.message : "Please check your Steam ID and try again"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background cyber-grid-animated p-4 relative">
      {/* Animated background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-[var(--neon-cyan)] rounded-full blur-[120px] opacity-10 animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[var(--neon-magenta)] rounded-full blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="glass-card rounded-sm border-2 border-[var(--neon-cyan)]/30 p-8">
          <div className="text-center space-y-6 mb-8">
            <div className="mx-auto w-20 h-20 rounded bg-black/40 border-2 border-[var(--neon-cyan)] flex items-center justify-center neon-glow-cyan">
              <Gamepad2 className="w-10 h-10 text-[var(--neon-cyan)]" />
            </div>
            <div>
              <h2 className="text-3xl font-bold gradient-text-cyber uppercase tracking-wider mb-3">
                Connect Steam
              </h2>
              <p className="text-muted-foreground uppercase tracking-wide text-sm">
                Link your Steam account to start earning rewards
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="steamInput" className="text-sm font-bold uppercase tracking-wider text-[var(--neon-cyan)]">
                Steam Profile URL or ID
              </label>
              <Input
                id="steamInput"
                placeholder="https://steamcommunity.com/profiles/76561198..."
                value={steamInput}
                onChange={(e) => setSteamInput(e.target.value)}
                disabled={isLoading}
                className="glass-card border-2 border-[var(--neon-purple)]/30 h-12 text-base"
                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  ✓ Paste your Steam profile URL
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  ✓ Or enter your 17-digit Steam ID
                </p>
                <p className="text-xs text-[var(--neon-cyan)] font-semibold uppercase tracking-wide">
                  Find your ID at{" "}
                  <a
                    href="https://steamid.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--neon-magenta)] transition-colors underline"
                  >
                    steamid.io
                  </a>
                </p>
              </div>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full glass-card border-2 border-[var(--neon-magenta)] hover:neon-glow-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 font-bold uppercase tracking-wider h-14 text-base"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  CONNECTING...
                </>
              ) : (
                <>
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  CONNECT STEAM
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
