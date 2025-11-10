import { useState } from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { DashboardLayout } from "@/pages/dashboard/_components/dashboard-layout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Crown, Sparkles, Zap, Trophy, ExternalLink, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { UnauthenticatedPage } from "@/components/ui/unauthenticated-page.tsx";
import { purchasePremiumPassTransaction, claimPremiumQuestTransaction } from "@/lib/wallet.ts";
import { checkWalletConnection } from "@/lib/wallet-check.ts";

export default function PremiumPass() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <PremiumPassContent />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedPage />
      </Unauthenticated>
    </>
  );
}

function PremiumPassContent() {
  const passInfo = useQuery(api.premiumPass.getPremiumPassInfo, {});
  const hasPass = useQuery(api.premiumPass.hasActivePremiumPass, {});
  const premiumQuests = useQuery(api.premiumPass.getPremiumQuests, {});
  const activatePass = useMutation(api.premiumPass.activatePremiumPass);
  const syncProgress = useMutation(api.premiumPass.syncPremiumQuestProgress);
  const claimReward = useMutation(api.premiumPass.claimPremiumReward);
  const initQuests = useMutation(api.initPremiumQuests.initializePremiumQuests);

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!checkWalletConnection()) return;

    setIsPurchasing(true);
    try {
      toast.info("Creating transaction on CARV SVM Testnet...");
      
      const { signature, explorerUrl } = await purchasePremiumPassTransaction();
      
      toast.success("Transaction submitted! Activating pass...", {
        description: (
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--neon-cyan)] hover:underline flex items-center gap-1">
            View on Explorer <ExternalLink className="w-3 h-3" />
          </a>
        ),
      });

      await activatePass({ txHash: signature });
      
      // Initialize quests if needed
      await initQuests({});
      
      toast.success("Premium Pass Activated! 🎉");
    } catch (error) {
      console.error("Purchase failed:", error);
      const err = error as Error;
      toast.error("Purchase failed", { description: err.message });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleClaimReward = async (questId: string) => {
    if (!checkWalletConnection()) return;

    setSelectedQuestId(questId);
    try {
      // Find the quest to get day number
      const quest = premiumQuests?.quests.find((q) => q.id === questId);
      if (!quest || !quest.dayNumber) {
        throw new Error("Quest not found");
      }

      toast.info("Creating claim transaction on CARV SVM Testnet...");
      
      const { signature, explorerUrl } = await claimPremiumQuestTransaction(
        quest.title,
        quest.dayNumber
      );
      
      toast.success("Transaction submitted! Processing claim...", {
        description: (
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--neon-cyan)] hover:underline flex items-center gap-1">
            View on Explorer <ExternalLink className="w-3 h-3" />
          </a>
        ),
      });

      await claimReward({ questId, txHash: signature });
      
      if (quest.rewardType === "points") {
        toast.success(`${quest.title} completed! +${quest.pointsReward} points 🎉`);
      } else {
        toast.success(`${quest.title} completed! ${quest.rewardData}`);
      }
    } catch (error) {
      console.error("Claim failed:", error);
      const err = error as Error;
      toast.error("Failed to claim reward", { description: err.message });
    } finally {
      setSelectedQuestId(null);
    }
  };

  const handleSync = async () => {
    try {
      await syncProgress({});
      toast.success("Progress synced!");
    } catch (error) {
      console.error("Sync failed:", error);
      toast.error("Failed to sync progress");
    }
  };

  const daysRemaining = passInfo
    ? Math.max(0, Math.ceil((passInfo.expiryDate - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-purple)]/30 neon-glow-purple relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--neon-purple)]/10 via-[var(--neon-cyan)]/10 to-[var(--neon-magenta)]/10" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-black/40 border-2 border-[var(--neon-purple)] flex items-center justify-center neon-glow-purple">
              <Crown className="w-8 h-8 text-[var(--neon-purple)]" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold gradient-text-cyber tracking-wider uppercase">
                Premium Pass
              </h1>
              <p className="text-muted-foreground text-sm uppercase tracking-wide mt-1">
                Unlock exclusive monthly quests and rewards
              </p>
            </div>
            {hasPass && (
              <Badge className="bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-white font-bold uppercase tracking-wider text-lg px-4 py-2 neon-glow-cyan">
                <Crown className="w-4 h-4 mr-2" />
                Active
              </Badge>
            )}
          </div>
        </div>

        {!hasPass ? (
          <>
            {/* Purchase Section */}
            <Card className="glass-card border-2 border-[var(--neon-cyan)]/30">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[var(--neon-cyan)] uppercase tracking-wide">
                  Get Premium Pass
                </CardTitle>
                <CardDescription className="text-muted-foreground uppercase tracking-wide">
                  Access exclusive monthly quests and unlock special emoji rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-[var(--neon-purple)] uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      What's Included
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "8 Exclusive monthly quests",
                        "Unlock special emojis & stickers",
                        "Access to premium rewards store",
                        "Valid for 30 days",
                        "Automatic quest progress tracking",
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-[var(--neon-cyan)]/20 border border-[var(--neon-cyan)] flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-[var(--neon-cyan)]" />
                          </div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-card p-6 border-2 border-[var(--neon-purple)]/30 space-y-4">
                    <div className="text-center space-y-2">
                      <div className="text-5xl font-bold gradient-text-cyber">
                        0.05
                      </div>
                      <div className="text-sm text-muted-foreground uppercase tracking-wide">
                        TEST SOL
                      </div>
                      <div className="text-xs text-muted-foreground">
                        on CARV SVM Testnet
                      </div>
                    </div>

                    <Button
                      onClick={handlePurchase}
                      disabled={isPurchasing}
                      className="w-full glass-card border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 hover:neon-glow-cyan font-bold uppercase tracking-wider py-6 text-lg"
                    >
                      {isPurchasing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Crown className="w-5 h-5 mr-2" />
                          Purchase Now
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Requires Backpack wallet connected to CARV SVM Testnet
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Pass Info */}
            <Card className="glass-card border-2 border-[var(--neon-cyan)]/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">
                      Pass Expires In
                    </p>
                    <p className="text-2xl font-bold text-[var(--neon-cyan)]">
                      {daysRemaining} Days
                    </p>
                  </div>
                  <Button
                    onClick={handleSync}
                    variant="outline"
                    className="glass-card border-[var(--neon-purple)]/30 text-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/10 uppercase tracking-wide"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Sync Progress
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Premium Quests */}
            <Card className="glass-card border-2 border-[var(--neon-purple)]/30">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[var(--neon-purple)] uppercase tracking-wide flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Premium Quests
                </CardTitle>
                <CardDescription className="text-muted-foreground uppercase tracking-wide">
                  Complete quests to unlock exclusive rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!premiumQuests || premiumQuests.quests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading quests...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wide">
                      ⚠️ You can claim one quest per day. Missed days cannot be claimed later. Bonus points awarded every 5 days!
                    </p>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {premiumQuests.quests.map((quest) => {
                        const progress = premiumQuests.userProgress.find(
                          (p) => p.questId === quest.id
                        );

                        return (
                          <div
                            key={quest.id}
                            className={`glass-card p-4 border-2 space-y-3 ${
                              progress?.claimed
                                ? "border-[var(--neon-purple)]/20"
                                : "border-[var(--neon-cyan)]/20"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-foreground uppercase tracking-wide text-sm">
                                  {quest.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {quest.description}
                                </p>
                              </div>
                              <div className="text-2xl flex-shrink-0">
                                {quest.rewardType === "points" ? `${quest.pointsReward}pts` : quest.rewardData}
                              </div>
                            </div>

                            {!progress?.claimed && (
                              <Button
                                onClick={() => handleClaimReward(quest.id)}
                                disabled={selectedQuestId === quest.id}
                                className="w-full glass-card border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 font-semibold uppercase tracking-wider"
                              >
                                {selectedQuestId === quest.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Claiming...
                                  </>
                                ) : (
                                  <>
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Claim
                                  </>
                                )}
                              </Button>
                            )}

                            {progress?.claimed && (
                              <div className="text-center py-2 glass-card border border-[var(--neon-purple)]/20">
                                <span className="text-sm text-[var(--neon-purple)] font-semibold uppercase tracking-wide">
                                  ✓ Claimed
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
