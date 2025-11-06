import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Loader2, Gamepad2 } from "lucide-react";
import { toast } from "sonner";

export function SteamConnect() {
  const [steamId, setSteamId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const linkSteam = useAction(api.steam.linkSteamAccount);
  const saveSteamProfile = useMutation(api.profiles.saveSteamProfile);
  const saveGames = useMutation(api.profiles.saveGames);

  const handleConnect = async () => {
    if (!steamId.trim()) {
      toast.error("Please enter your Steam ID");
      return;
    }

    setIsLoading(true);
    try {
      const data = await linkSteam({ steamId: steamId.trim() });
      
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

      toast.success("Steam account connected successfully!");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect Steam account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Connect Your Steam Account</CardTitle>
          <CardDescription>
            Enter your Steam ID to sync your games, achievements, and start earning rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="steamId" className="text-sm font-medium">
              Steam ID
            </label>
            <Input
              id="steamId"
              placeholder="76561198012345678"
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Find your Steam ID on{" "}
              <a
                href="https://steamid.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                steamid.io
              </a>
            </p>
          </div>

          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Gamepad2 className="w-4 h-4 mr-2" />
                Connect Steam
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
