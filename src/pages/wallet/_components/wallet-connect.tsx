import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Wallet, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { connectBackpackWallet, isBackpackInstalled } from "@/lib/wallet.ts";

export function WalletConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const connectWallet = useMutation(api.wallets.connectWallet);
  const isInstalled = isBackpackInstalled();

  const handleConnect = async () => {
    if (!isInstalled) {
      toast.error("Please install Backpack wallet extension first");
      return;
    }

    setIsConnecting(true);
    try {
      const walletAddress = await connectBackpackWallet();
      
      await connectWallet({
        walletAddress,
        walletType: "backpack",
      });

      toast.success("Wallet connected successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
          <CardDescription>
            Connect Backpack wallet to interact with CARV SVM Testnet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isInstalled && (
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

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold">Why connect a wallet?</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Mint your Steam trading cards as NFTs</li>
                <li>Trade and showcase your digital collectibles</li>
                <li>Participate in the Web3 gaming ecosystem</li>
                <li>Earn rewards on CARV SVM Testnet</li>
              </ul>
            </div>

            <Button
              onClick={handleConnect}
              disabled={isConnecting || !isInstalled}
              size="lg"
              className="w-full"
            >
              {isConnecting ? (
                "Connecting..."
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Backpack
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>CARV SVM Testnet RPC:</p>
            <code className="bg-muted px-2 py-1 rounded">
              https://rpc.testnet.carv.io/rpc
            </code>
          </div>
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
