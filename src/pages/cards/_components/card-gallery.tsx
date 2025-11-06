import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Sparkles, Check } from "lucide-react";
import { MintDialog } from "./mint-dialog.tsx";

interface CardGalleryProps {
  cards: Doc<"tradingCards">[];
  wallet: Doc<"wallets"> | null;
}

const RARITY_COLORS: Record<string, string> = {
  Common: "bg-gray-500",
  Uncommon: "bg-green-500",
  Rare: "bg-blue-500",
  Epic: "bg-purple-500",
  Legendary: "bg-orange-500",
};

const RARITY_BORDER: Record<string, string> = {
  Common: "border-gray-500",
  Uncommon: "border-green-500",
  Rare: "border-blue-500",
  Epic: "border-purple-500",
  Legendary: "border-orange-500",
};

export function CardGallery({ cards, wallet }: CardGalleryProps) {
  const [selectedCard, setSelectedCard] = useState<Doc<"tradingCards"> | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card
            key={card._id}
            className={`overflow-hidden hover:shadow-lg transition-shadow ${
              RARITY_BORDER[card.rarity]
            } border-2`}
          >
            <div className="aspect-[3/4] bg-muted relative overflow-hidden">
              <img
                src={card.imageUrl}
                alt={card.cardName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              {card.mintedAsNft && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  NFT
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge className={RARITY_COLORS[card.rarity]}>
                  {card.rarity}
                </Badge>
              </div>
            </div>
            <CardContent className="pt-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{card.cardName}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {card.gameName}
                </p>
              </div>

              {card.mintedAsNft ? (
                <Button disabled variant="secondary" className="w-full" size="sm">
                  <Check className="w-4 h-4 mr-2" />
                  Minted as NFT
                </Button>
              ) : (
                <Button
                  onClick={() => setSelectedCard(card)}
                  disabled={!wallet}
                  className="w-full"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {wallet ? "Mint as NFT" : "Connect Wallet"}
                </Button>
              )}

              {card.mintedAsNft && card.nftTokenId && (
                <div className="text-xs text-muted-foreground">
                  Token ID: {card.nftTokenId}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCard && wallet && (
        <MintDialog
          card={selectedCard}
          wallet={wallet}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </>
  );
}
