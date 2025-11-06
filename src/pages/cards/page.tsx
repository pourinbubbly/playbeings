import { Authenticated, AuthLoading } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { CardGallery } from "./_components/card-gallery.tsx";
import { CardStats } from "./_components/card-stats.tsx";
import { EarnCardDemo } from "./_components/earn-card-demo.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";
import { CreditCard } from "lucide-react";

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

function CardsContent() {
  const cards = useQuery(api.cards.getUserCards);
  const cardStats = useQuery(api.cards.getCardStats);
  const connectedWallet = useQuery(api.wallets.getConnectedWallet);

  if (cards === undefined || cardStats === undefined || connectedWallet === undefined) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Trading Cards</CardTitle>
            <CardDescription>
              Earn trading cards by playing games and mint them as NFTs on CARV SVM
            </CardDescription>
          </CardHeader>
        </Card>

        {cardStats && <CardStats stats={cardStats} />}

        <EarnCardDemo />

        {cards.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <CreditCard />
                  </EmptyMedia>
                  <EmptyTitle>No trading cards yet</EmptyTitle>
                  <EmptyDescription>
                    Play games and complete quests to earn trading cards
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        ) : (
          <CardGallery cards={cards} wallet={connectedWallet} />
        )}
      </div>
    </DashboardLayout>
  );
}
