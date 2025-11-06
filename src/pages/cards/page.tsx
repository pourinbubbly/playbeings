import { useState } from "react";
import { Authenticated, AuthLoading } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
import { SteamInventoryLoader } from "./_components/steam-inventory-loader.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Sparkles, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function Cards() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <CardsContent />
      </Authenticated>
    </>
  );
}

interface SteamCard {
  classid: string;
  name: string;
  marketName: string;
  imageUrl: string;
  gameName: string;
}

function CardsContent() {
  const [steamCards, setSteamCards] = useState<SteamCard[]>([]);
  const [minting, setMinting] = useState<string | null>(null);
  const connectedWallet = useQuery(api.wallets.getConnectedWallet);

  const handleMint = async (card: SteamCard) => {
    if (!connectedWallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    setMinting(card.classid);
    try {
      // Mock minting - in production this would call the actual NFT minting action
      await new Promise(resolve => setTimeout(resolve, 2000));
      const boost = 5 + Math.floor(Math.random() * 11);
      toast.success(`NFT Minted Successfully!`, {
        description: `+${boost}% point boost activated on CARV SVM Testnet!`,
      });
    } catch (error) {
      toast.error("Minting failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setMinting(null);
    }
  };

  if (connectedWallet === undefined) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-2xl border-2 border-primary/30 glow-primary">
          <CardHeader>
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              NFT Trading Cards
            </CardTitle>
            <CardDescription className="text-lg">
              Load your Steam trading cards and mint them as NFTs on CARV SVM Testnet
            </CardDescription>
          </CardHeader>
        </Card>

        <SteamInventoryLoader onCardsLoaded={setSteamCards} />

        {steamCards.length === 0 ? (
          <Card className="bg-card/60 backdrop-blur-2xl border-2 border-primary/20">
            <CardContent className="pt-6">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CreditCard />
                  </EmptyMedia>
                  <EmptyTitle>No trading cards loaded</EmptyTitle>
                  <EmptyDescription>
                    Click the button above to load your Steam trading cards
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {steamCards.map((card, index) => (
              <Card
                key={card.classid || index}
                className="overflow-hidden bg-card/60 backdrop-blur-2xl border-2 border-primary/20 hover:border-primary/50 hover:glow-primary transition-all"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white glow-primary">
                      Trading Card
                    </Badge>
                  </div>
                </div>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h3 className="font-bold line-clamp-1">{card.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {card.gameName}
                    </p>
                  </div>

                  <Button
                    disabled={!connectedWallet || minting !== null}
                    onClick={() => handleMint(card)}
                    className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:glow-primary transition-all"
                    size="sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {minting === card.classid ? "Minting..." : connectedWallet ? "Mint NFT (+5-15% Boost)" : "Connect Wallet"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
