import { useState } from "react";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Wallet, Copy, ExternalLink, LogOut, Check } from "lucide-react";
import { toast } from "sonner";
import { disconnectBackpackWallet, connectBackpackWallet, isBackpackInstalled, connectMetaMask, isMetaMaskInstalled } from "@/lib/wallet.ts";

interface WalletInfoProps {
  wallet: Doc<"wallets">;
}

export function WalletInfo({ wallet }: WalletInfoProps) {
  const [isCopiedBackpack, setIsCopiedBackpack] = useState(false);
  const [isCopiedMetaMask, setIsCopiedMetaMask] = useState(false);
  const [isDisconnectingBackpack, setIsDisconnectingBackpack] = useState(false);
  const [isDisconnectingMetaMask, setIsDisconnectingMetaMask] = useState(false);
  const [isConnectingBackpack, setIsConnectingBackpack] = useState(false);
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState(false);
  
  const disconnectWallet = useMutation(api.wallets.disconnectWallet);
  const disconnectMetaMaskMutation = useMutation(api.wallets.disconnectMetaMask);
  const connectWallet = useMutation(api.wallets.connectWallet);
  const connectMetaMaskMutation = useMutation(api.wallets.connectMetaMask);

  const handleCopyBackpack = async () => {
    await navigator.clipboard.writeText(wallet.walletAddress);
    setIsCopiedBackpack(true);
    toast.success("Backpack address copied");
    setTimeout(() => setIsCopiedBackpack(false), 2000);
  };

  const handleCopyMetaMask = async () => {
    if (wallet.evmAddress) {
      await navigator.clipboard.writeText(wallet.evmAddress);
      setIsCopiedMetaMask(true);
      toast.success("MetaMask address copied");
      setTimeout(() => setIsCopiedMetaMask(false), 2000);
    }
  };

  const handleDisconnectBackpack = async () => {
    setIsDisconnectingBackpack(true);
    try {
      await disconnectBackpackWallet();
      await disconnectWallet();
      toast.success("Backpack wallet disconnected");
    } catch (error) {
      toast.error("Failed to disconnect Backpack");
    } finally {
      setIsDisconnectingBackpack(false);
    }
  };

  const handleDisconnectMetaMask = async () => {
    setIsDisconnectingMetaMask(true);
    try {
      await disconnectMetaMaskMutation();
      toast.success("MetaMask wallet disconnected");
    } catch (error) {
      toast.error("Failed to disconnect MetaMask");
    } finally {
      setIsDisconnectingMetaMask(false);
    }
  };

  const handleConnectBackpack = async () => {
    if (!isBackpackInstalled()) {
      toast.error("Please install Backpack wallet extension first");
      return;
    }

    setIsConnectingBackpack(true);
    try {
      const walletAddress = await connectBackpackWallet();
      await connectWallet({
        walletAddress,
        walletType: "backpack",
      });
      toast.success("Backpack wallet connected successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect Backpack");
    } finally {
      setIsConnectingBackpack(false);
    }
  };

  const handleConnectMetaMask = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error("Please install MetaMask extension first");
      return;
    }

    setIsConnectingMetaMask(true);
    try {
      const evmAddress = await connectMetaMask();
      await connectMetaMaskMutation({
        evmAddress,
      });
      toast.success("MetaMask wallet connected successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect MetaMask");
    } finally {
      setIsConnectingMetaMask(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Backpack Wallet */}
      <Card className="border-[var(--neon-cyan)]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--neon-cyan)]/10 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[var(--neon-cyan)]" />
              </div>
              <div>
                <CardTitle className="text-xl">Backpack Wallet (Solana)</CardTitle>
                <CardDescription>
                  For CARV SVM transactions
                </CardDescription>
              </div>
            </div>
            {wallet.walletAddress && (
              <Badge variant="default" className="bg-green-500">
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {wallet.walletAddress ? (
            <>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-2">Wallet Address</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono break-all">
                    {wallet.walletAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyBackpack}
                    className="flex-shrink-0"
                  >
                    {isCopiedBackpack ? (
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
                    href={`http://explorer.testnet.carv.io/address/${wallet.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Explorer
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisconnectBackpack}
                  disabled={isDisconnectingBackpack}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isDisconnectingBackpack ? "Disconnecting..." : "Disconnect"}
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={handleConnectBackpack}
              disabled={isConnectingBackpack}
              size="lg"
              className="w-full bg-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/80 text-black"
            >
              {isConnectingBackpack ? "Connecting..." : "Connect Backpack"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* MetaMask Wallet */}
      <Card className="border-[var(--neon-purple)]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--neon-purple)]/10 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[var(--neon-purple)]" />
              </div>
              <div>
                <CardTitle className="text-xl">MetaMask (Ethereum)</CardTitle>
                <CardDescription>
                  For CARV D.A.T.A. Framework
                </CardDescription>
              </div>
            </div>
            {wallet.evmAddress && (
              <Badge variant="default" className="bg-green-500">
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {wallet.evmAddress ? (
            <>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-2">EVM Address</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono break-all">
                    {wallet.evmAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyMetaMask}
                    className="flex-shrink-0"
                  >
                    {isCopiedMetaMask ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={handleDisconnectMetaMask}
                disabled={isDisconnectingMetaMask}
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isDisconnectingMetaMask ? "Disconnecting..." : "Disconnect MetaMask"}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleConnectMetaMask}
              disabled={isConnectingMetaMask}
              size="lg"
              className="w-full bg-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/80 text-white"
            >
              {isConnectingMetaMask ? "Connecting..." : "Connect MetaMask"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
