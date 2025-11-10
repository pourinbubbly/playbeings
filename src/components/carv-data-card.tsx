import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Shield, ExternalLink, Wallet, Check, Copy } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useState } from "react";
import { toast } from "sonner";

interface CarvDataCardProps {
  userId: Id<"users">;
  carvId?: string | null;
  reputationScore?: number | null;
  lastSync?: number | null;
  isWalletConnected?: boolean;
  evmAddress?: string | null;
}

export function CarvDataCard({ userId, carvId, reputationScore, lastSync, isWalletConnected = false, evmAddress }: CarvDataCardProps) {
  const [inputCarvId, setInputCarvId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const updateCarvId = useMutation(api.users.updateCarvId);

  const handleCopyId = () => {
    if (carvId) {
      navigator.clipboard.writeText(carvId);
      setCopied(true);
      toast.success("CARV ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitCarvId = async () => {
    if (!inputCarvId.trim()) {
      toast.error("Please enter a valid CARV ID");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCarvId({ carvId: inputCarvId.trim() });
      toast.success("CARV ID linked successfully!");
      setInputCarvId("");
    } catch (error) {
      console.error("Error updating CARV ID:", error);
      toast.error("Failed to link CARV ID");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                {carvId ? "Identity Linked" : "MetaMask Connected"}
              </CardDescription>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full ${carvId ? "bg-green-500/20 border-green-500/50" : "bg-yellow-500/20 border-yellow-500/50"} border`}>
            <span className={`text-xs font-semibold ${carvId ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"}`}>
              {carvId ? "VERIFIED" : "PENDING"}
            </span>
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

          {/* CARV ID Section */}
          {carvId ? (
            <div className="glass-card p-4 border border-green-500/20">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>CARV Identity ID</span>
                  </div>
                  <button
                    onClick={handleCopyId}
                    className="p-1.5 rounded-md hover:bg-background/50 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <code className="text-xs font-mono text-green-500 break-all">
                  {carvId}
                </code>
                <Button
                  size="sm"
                  asChild
                  className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/50"
                >
                  <a
                    href={`https://protocol.carv.io/identity/${carvId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on CARV Protocol
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-4 border border-[var(--neon-purple)]/20">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Link CARV Identity</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your CARV ID from the CARV Protocol portal and enter it below
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your CARV ID"
                    value={inputCarvId}
                    onChange={(e) => setInputCarvId(e.target.value)}
                    className="flex-1 bg-background/50 border-[var(--neon-cyan)]/30"
                    disabled={isSubmitting}
                  />
                  <Button
                    onClick={handleSubmitCarvId}
                    disabled={isSubmitting || !inputCarvId.trim()}
                    className="bg-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/80 text-black"
                  >
                    {isSubmitting ? "Linking..." : "Link"}
                  </Button>
                </div>
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
                    Get CARV ID from Portal
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </a>
                </Button>
              </div>
            </div>
          )}

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
