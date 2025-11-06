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
      toast.error("Please connect your Steam account first");
      return;
    }

    setIsLoading(true);
    try {
      const cards = await getSteamInventory({ steamId: steamProfile.steamId });
      onCardsLoaded(cards as SteamCard[]);
      toast.success(`Found ${cards.length} trading cards in your inventory`);
    } catch (error) {
      toast.error("Failed to load Steam inventory");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-primary/30 bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg">Load Steam Trading Cards</CardTitle>
        <CardDescription>
          Import your real Steam trading cards from your inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleLoadInventory}
          disabled={isLoading || !steamProfile}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading Inventory...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Load Trading Cards from Steam
            </>
          )}
        </Button>
        {!steamProfile && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Connect your Steam account first
          </p>
        )}
      </CardContent>
    </Card>
  );
}
