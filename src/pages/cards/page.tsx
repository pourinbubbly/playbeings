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
      <div className="space-y-8">
        {/* Header Card */}
        <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 neon-glow-cyan">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded bg-black/40 border-2 border-[var(--neon-cyan)] flex items-center justify-center neon-glow-cyan">
              <CreditCard className="w-8 h-8 text-[var(--neon-cyan)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text-cyber tracking-wider uppercase">
                NFT Trading Cards
              </h1>
              <p className="text-muted-foreground text-sm uppercase tracking-wide mt-1">
                Load Steam cards • Mint as NFTs • Earn 5-15% boost
              </p>
            </div>
          </div>
        </div>

        <SteamInventoryLoader onCardsLoaded={setSteamCards} />

        {steamCards.length === 0 ? (
          <div className="glass-card p-12 rounded-sm border-2 border-dashed border-[var(--neon-magenta)]/30">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CreditCard className="text-[var(--neon-magenta)]" />
                </EmptyMedia>
                <EmptyTitle className="gradient-text-purple text-2xl uppercase tracking-wider">No Cards Loaded</EmptyTitle>
                <EmptyDescription className="text-muted-foreground text-sm uppercase tracking-wide">
                  Click the button above • Load your Steam inventory • Make sure it's public
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {steamCards.map((card, index) => (
              <div
                key={card.classid || index}
                className="glass-card rounded-sm border-2 border-[var(--neon-cyan)]/20 overflow-hidden hover-glow-cyan transition-all group"
              >
                <div className="aspect-[3/4] bg-black/40 relative overflow-hidden border-b-2 border-[var(--neon-cyan)]/20">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-[var(--neon-cyan)]/20 border border-[var(--neon-cyan)] text-[var(--neon-cyan)] font-semibold uppercase tracking-wider text-xs"
                    >
                      Trading Card
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="font-bold line-clamp-1 text-foreground uppercase tracking-wide text-sm">{card.name}</h3>
                    <p className="text-xs text-[var(--neon-cyan)] line-clamp-1 uppercase tracking-wide font-semibold mt-1">
                      {card.gameName}
                    </p>
                  </div>

                  <Button
                    disabled={!connectedWallet || minting !== null}
                    onClick={() => handleMint(card)}
                    className="w-full glass-card border-2 border-[var(--neon-magenta)] hover:neon-glow-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 font-bold uppercase tracking-wider transition-all"
                    size="sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {minting === card.classid ? "MINTING..." : connectedWallet ? "MINT NFT" : "CONNECT WALLET"}
                  </Button>
                  {connectedWallet && (
                    <p className="text-xs text-center text-[var(--neon-purple)] font-semibold uppercase tracking-wide">
                      +{5 + Math.floor(Math.random() * 11)}% Boost
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
