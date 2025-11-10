import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Shield, ExternalLink, Wallet } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

interface CarvDataCardProps {
  userId: Id<"users">;
  carvId?: string | null;
  reputationScore?: number | null;
  lastSync?: number | null;
  isWalletConnected?: boolean;
  evmAddress?: string | null;
}

export function CarvDataCard({ userId, carvId, reputationScore, lastSync, isWalletConnected = false, evmAddress }: CarvDataCardProps) {

  if (!isWalletConnected) {
    return (
      <Card className="glass-card border-2 border-[var(--neon-cyan)]/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[var(--neon-cyan)]" />
            <div>
              <CardTitle className="text-xl text-[var(--neon-cyan)] uppercase tracking-wider">
                CARV D.A.T.A.
              </CardTitle>
              <CardDescription className="uppercase tracking-wide text-xs">
                On-Chain Identity Framework
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-sm mb-4">
              Connect MetaMask wallet to link your CARV identity
            </p>
            <Button 
              asChild
              className="bg-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/80 text-black"
            >
              <a href="/dashboard/wallet">
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Powered by CARV D.A.T.A. Framework
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card border-2 border-[var(--neon-cyan)]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[var(--neon-cyan)]" />
            <div>
              <CardTitle className="text-xl text-[var(--neon-cyan)] uppercase tracking-wider">
                CARV D.A.T.A.
              </CardTitle>
              <CardDescription className="uppercase tracking-wide text-xs">
                MetaMask Connected
              </CardDescription>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/50">
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">ACTIVE</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Wallet Address */}
          <div className="glass-card p-4 border border-[var(--neon-purple)]/20">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Wallet className="w-4 h-4" />
                <span>Connected Wallet</span>
              </div>
              <code className="text-xs font-mono text-[var(--neon-cyan)] break-all">
                {evmAddress || "Not available"}
              </code>
            </div>
          </div>

          {/* CARV Identity Portal Link */}
          <div className="glass-card p-4 border border-[var(--neon-purple)]/20">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>CARV Identity Portal</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Manage your on-chain identity, reputation, and credentials
              </p>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full border-[var(--neon-cyan)]/50 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10"
              >
                <a
                  href="https://protocol.carv.io/identity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open CARV Portal
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground text-center pt-2">
            <p>CARV D.A.T.A. Framework provides decentralized identity,</p>
            <p>reputation scoring, and verifiable credentials</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
