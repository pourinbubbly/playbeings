import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function EarnCardDemo() {
  const [isEarning, setIsEarning] = useState(false);
  const earnCard = useMutation(api.cards.earnTradingCard);
  const games = useQuery(api.profiles.getUserGames);

  const handleEarnCard = async () => {
    if (!games || games.length === 0) {
      toast.error("No games found. Please sync your Steam account first.");
      return;
    }

    setIsEarning(true);
    try {
      // Pick a random game from user's library
      const randomGame = games[Math.floor(Math.random() * games.length)];

      const result = await earnCard({
        appId: randomGame.appId,
        gameName: randomGame.name,
        imageUrl: randomGame.imageUrl,
      });

      toast.success(
        `You earned a ${result.rarity} trading card! +${result.points} points`,
        { duration: 5000 }
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to earn card");
    } finally {
      setIsEarning(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">Demo: Earn Trading Card</CardTitle>
        <CardDescription>
          In production, cards are earned automatically by playing games. Click to simulate earning a card.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleEarnCard}
          disabled={isEarning || !games || games.length === 0}
          variant="secondary"
          className="w-full"
        >
          {isEarning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Earning Card...
            </>
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />
              Earn Random Trading Card
            </>
          )}
        </Button>
        {(!games || games.length === 0) && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Please connect your Steam account first
          </p>
        )}
      </CardContent>
    </Card>
  );
}
