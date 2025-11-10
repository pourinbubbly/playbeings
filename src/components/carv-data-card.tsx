import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Shield, Star, RefreshCw, ExternalLink, Loader2 } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useState } from "react";
import { toast } from "sonner";

interface CarvDataCardProps {
  userId: Id<"users">;
  carvId?: string | null;
  reputationScore?: number | null;
  lastSync?: number | null;
}

export function CarvDataCard({ userId, carvId, reputationScore, lastSync }: CarvDataCardProps) {
  const [syncing, setSyncing] = useState(false);
  const syncCarvData = useAction(api.carv.syncCarvData);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncCarvData({ userId });
      if (result.success) {
        toast.success("CARV data synced successfully");
      } else {
        toast.error(result.message || "Failed to sync CARV data");
      }
    } catch (error) {
      toast.error("Failed to sync CARV data");
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  const getLastSyncText = () => {
    if (!lastSync) return "Never synced";
    const diff = Date.now() - lastSync;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!carvId) {
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
                On-Chain Identity
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-sm mb-4">
              Connect your wallet to sync CARV data
            </p>
            <Button 
              onClick={handleSync}
              disabled={syncing}
              className="bg-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/80 text-black"
            >
              {syncing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {syncing ? "Syncing..." : "Sync CARV Data"}
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
                On-Chain Verified
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="text-[var(--neon-cyan)]"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* CARV ID */}
          <div className="glass-card p-4 border border-[var(--neon-purple)]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>CARV ID</span>
              </div>
              <a
                href={`https://explorer.carv.io/id/${carvId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--neon-cyan)] hover:underline text-sm flex items-center gap-1"
              >
                {carvId.slice(0, 8)}...{carvId.slice(-6)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Reputation Score */}
          <div className="glass-card p-4 border border-[var(--neon-purple)]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4" />
                <span>Reputation</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                {reputationScore || 0}
              </span>
            </div>
          </div>

          {/* Last Sync */}
          <div className="text-xs text-muted-foreground text-center">
            Last synced: {getLastSyncText()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
