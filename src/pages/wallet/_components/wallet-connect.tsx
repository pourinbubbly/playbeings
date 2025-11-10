import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Wallet, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { connectBackpackWallet, isBackpackInstalled, connectMetaMask, isMetaMaskInstalled } from "@/lib/wallet.ts";

export function WalletConnect() {
  const [isConnectingBackpack, setIsConnectingBackpack] = useState(false);
  const [isConnectingMetaMask, setIsConnectingMetaMask] = useState(false);
  const connectWallet = useMutation(api.wallets.connectWallet);
  const connectMetaMaskMutation = useMutation(api.wallets.connectMetaMask);
  const isBackpackAvailable = isBackpackInstalled();
  const isMetaMaskAvailable = isMetaMaskInstalled();

  const handleConnectBackpack = async () => {
    if (!isBackpackAvailable) {
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
    if (!isMetaMaskAvailable) {
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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--neon-cyan)]/10 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[var(--neon-cyan)]" />
            </div>
            <div>
              <CardTitle className="text-xl">Backpack Wallet (Solana)</CardTitle>
              <CardDescription>
                For CARV SVM Testnet transactions, NFT minting, Premium Pass
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isBackpackAvailable && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Backpack wallet not detected</span>
                <Button
                  variant="link"
                  size="sm"
                  asChild
                  className="h-auto p-0"
                >
                  <a
                    href="https://www.backpack.app"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Install Backpack
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleConnectBackpack}
            disabled={isConnectingBackpack || !isBackpackAvailable}
            size="lg"
            className="w-full bg-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/80 text-black"
          >
            {isConnectingBackpack ? (
              "Connecting..."
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Backpack
              </>
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <p>CARV SVM Testnet RPC:</p>
            <code className="bg-muted px-2 py-1 rounded">
              https://rpc.testnet.carv.io/rpc
            </code>
          </div>
        </CardContent>
      </Card>

      {/* MetaMask Wallet */}
      <Card className="border-[var(--neon-purple)]/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--neon-purple)]/10 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[var(--neon-purple)]" />
            </div>
            <div>
              <CardTitle className="text-xl">MetaMask (Ethereum)</CardTitle>
              <CardDescription>
                For CARV D.A.T.A. Framework on-chain identity and reputation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isMetaMaskAvailable && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>MetaMask wallet not detected</span>
                <Button
                  variant="link"
                  size="sm"
                  asChild
                  className="h-auto p-0"
                >
                  <a
                    href="https://metamask.io"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Install MetaMask
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleConnectMetaMask}
            disabled={isConnectingMetaMask || !isMetaMaskAvailable}
            size="lg"
            className="w-full bg-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/80 text-white"
          >
            {isConnectingMetaMask ? (
              "Connecting..."
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Need Test Tokens?</CardTitle>
          <CardDescription>
            Get CARV SVM testnet tokens to start minting NFTs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
            asChild
            className="w-full"
          >
            <a
              href="https://docs.carv.io/svm-ai-agentic-chain/quick-start/bridge-token"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bridge Test Tokens
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
