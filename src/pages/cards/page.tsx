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
  const connectedWallet = useQuery(api.wallets.getConnectedWallet);

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
        <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl">Trading Cards</CardTitle>
            <CardDescription>
              Load your Steam trading cards and mint them as NFTs on CARV SVM
            </CardDescription>
          </CardHeader>
        </Card>

        <SteamInventoryLoader onCardsLoaded={setSteamCards} />

        {steamCards.length === 0 ? (
          <Card className="bg-card/30 backdrop-blur-sm">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {steamCards.map((card, index) => (
              <Card
                key={card.classid || index}
                className="overflow-hidden bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all"
              >
                <div className="aspect-[3/4] bg-gradient-to-br from-muted/50 to-primary/5 relative overflow-hidden">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-primary/80 backdrop-blur-sm">
                      Trading Card
                    </Badge>
                  </div>
                </div>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h3 className="font-semibold line-clamp-1">{card.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {card.gameName}
                    </p>
                  </div>

                  <Button
                    disabled={!connectedWallet}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all"
                    size="sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {connectedWallet ? "Mint as NFT" : "Connect Wallet"}
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
