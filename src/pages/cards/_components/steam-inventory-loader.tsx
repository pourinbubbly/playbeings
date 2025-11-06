import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface SteamCard {
  classid: string;
  name: string;
  marketName: string;
  imageUrl: string;
  gameName: string;
}

export function SteamInventoryLoader({ onCardsLoaded }: { onCardsLoaded: (cards: SteamCard[]) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const getSteamInventory = useAction(api.steam.getSteamInventory);
  const steamProfile = useQuery(api.profiles.getSteamProfile);

  const handleLoadInventory = async () => {
    if (!steamProfile?.steamId) {
      toast.error("Please connect your Steam account first", {
        description: "Go to the Home page to connect your Steam account",
      });
      return;
    }

    setIsLoading(true);
    try {
      const cards = await getSteamInventory({ steamId: steamProfile.steamId });
      onCardsLoaded(cards as SteamCard[]);
      
      if (cards.length === 0) {
        toast.info("No trading cards found", {
          description: "Your Steam inventory doesn't have any tradable trading cards. You may need to make your inventory public in Steam settings.",
        });
      } else {
        toast.success(`Found ${cards.length} trading cards!`, {
          description: "Your Steam trading cards are ready to mint as NFTs",
        });
      }
    } catch (error) {
      toast.error("Failed to load Steam inventory", {
        description: "Make sure your Steam inventory is set to public in your Steam privacy settings.",
      });
      console.error("Inventory load error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-2xl glow-primary">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Load Steam Trading Cards</CardTitle>
        <CardDescription className="text-base">
          Import your real Steam trading cards from your inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleLoadInventory}
          disabled={isLoading || !steamProfile}
          className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:glow-primary transition-all"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading Inventory...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5 mr-2" />
              Load Trading Cards from Steam
            </>
          )}
        </Button>
        {!steamProfile && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-sm text-destructive font-medium text-center">
              ⚠️ Connect your Steam account first from the Home page
            </p>
          </div>
        )}
        {steamProfile && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Make sure your Steam inventory is set to public
          </p>
        )}
      </CardContent>
    </Card>
  );
}
