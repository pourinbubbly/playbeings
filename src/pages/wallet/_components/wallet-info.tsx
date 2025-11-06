import { useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Wallet, Copy, ExternalLink, LogOut, Check } from "lucide-react";
import { toast } from "sonner";
import { disconnectBackpackWallet } from "@/lib/wallet.ts";

interface WalletInfoProps {
  wallet: Doc<"wallets">;
}

export function WalletInfo({ wallet }: WalletInfoProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const disconnectWallet = useMutation(api.wallets.disconnectWallet);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(wallet.walletAddress);
    setIsCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectBackpackWallet();
      await disconnectWallet();
      toast.success("Wallet disconnected");
    } catch (error) {
      toast.error("Failed to disconnect wallet");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Wallet Connected</CardTitle>
                <CardDescription>
                  {wallet.walletType === "backpack" ? "Backpack" : "Unknown"} Wallet
                </CardDescription>
              </div>
            </div>
            <Badge variant="default" className="bg-green-500">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-2">Wallet Address</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono break-all">
                {wallet.walletAddress}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {isCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              asChild
            >
              <a
                href={`https://explorer.solana.com/address/${wallet.walletAddress}?cluster=custom&customUrl=https://rpc.testnet.carv.io/rpc`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Explorer
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isDisconnecting ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Network Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Network</span>
            <span className="font-medium">CARV SVM Testnet</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Chain</span>
            <span className="font-medium">Solana Compatible</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">RPC Endpoint</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              https://rpc.testnet.carv.io/rpc
            </code>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Ready to Mint NFTs?</CardTitle>
          <CardDescription>
            Your wallet is connected and ready to mint trading cards as NFTs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href="/dashboard/cards">
              Go to Trading Cards
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
