import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Loader2, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface MintDialogProps {
  card: Doc<"tradingCards">;
  wallet: Doc<"wallets">;
  onClose: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  Common: "bg-gray-500",
  Uncommon: "bg-green-500",
  Rare: "bg-blue-500",
  Epic: "bg-purple-500",
  Legendary: "bg-orange-500",
};

export function MintDialog({ card, wallet, onClose }: MintDialogProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const mintNFT = useAction(api.nft.mintTradingCardNFT);

  const handleMint = async () => {
    setIsMinting(true);
    try {
      const result = await mintNFT({
        cardId: card._id,
        walletAddress: wallet.walletAddress,
      });

      setTxHash(result.txHash);
      toast.success("NFT minted successfully! +50 bonus points");
      
      // Close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mint NFT");
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mint NFT</DialogTitle>
          <DialogDescription>
            Mint this trading card as an NFT on CARV SVM Testnet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Card Preview */}
          <div className="border rounded-lg overflow-hidden">
            <div className="aspect-[3/4] bg-muted relative">
              <img
                src={card.imageUrl}
                alt={card.cardName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute top-2 left-2">
                <Badge className={RARITY_COLORS[card.rarity]}>
                  {card.rarity}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-card">
              <h3 className="font-semibold">{card.cardName}</h3>
              <p className="text-sm text-muted-foreground">{card.gameName}</p>
            </div>
          </div>

          {/* Mint Info */}
          {!txHash && (
            <div className="space-y-2 bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network</span>
                <span className="font-medium">CARV SVM Testnet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Gas</span>
                <span className="font-medium">~0.001 CARV</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bonus Points</span>
                <span className="font-medium text-primary">+50 points</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {txHash && (
            <div className="space-y-2 bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                NFT Minted Successfully!
              </p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Transaction Hash:</p>
                <code className="text-xs break-all block bg-background p-2 rounded">
                  {txHash}
                </code>
              </div>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                asChild
              >
                <a
                  href={`https://explorer.solana.com/tx/${txHash}?cluster=custom&customUrl=https://rpc.testnet.carv.io/rpc`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Explorer
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </div>
          )}

          {/* Action Button */}
          {!txHash && (
            <Button
              onClick={handleMint}
              disabled={isMinting}
              className="w-full"
              size="lg"
            >
              {isMinting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Minting NFT...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Mint NFT
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
