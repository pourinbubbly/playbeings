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
          description: "No tradable trading cards found. Make sure your inventory is public in Steam Privacy Settings and you have trading cards in your inventory.",
        });
      } else {
        toast.success(`Found ${cards.length} trading cards!`, {
          description: "Your Steam trading cards are ready to mint as NFTs on CARV SVM testnet",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to load Steam inventory", {
        description: errorMessage.includes("private") 
          ? "Your Steam inventory is private. Please set it to public in Steam Privacy Settings."
          : "Make sure your Steam profile and inventory are set to public in your Steam privacy settings.",
      });
      console.error("Inventory load error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-sm border-2 border-dashed border-[var(--neon-magenta)]/30 p-8">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold gradient-text-purple uppercase tracking-wider mb-2">
            Load Steam Inventory
          </h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Import your real Steam trading cards
          </p>
        </div>

        <Button
          onClick={handleLoadInventory}
          disabled={isLoading || !steamProfile}
          className="w-full glass-card border-2 border-[var(--neon-purple)] hover:neon-glow-purple text-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/20 font-bold uppercase tracking-wider h-14 text-base"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              LOADING INVENTORY...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5 mr-2" />
              LOAD STEAM CARDS
            </>
          )}
        </Button>

        {!steamProfile && (
          <div className="p-4 rounded-sm glass-card border-2 border-destructive/30">
            <p className="text-sm text-destructive font-semibold text-center uppercase tracking-wide">
              ⚠️ Connect Steam first from Home page
            </p>
          </div>
        )}
        {steamProfile && (
          <p className="text-xs text-center text-[var(--neon-cyan)] font-semibold uppercase tracking-wide">
            Make sure your inventory is public
          </p>
        )}
      </div>
    </div>
  );
}
