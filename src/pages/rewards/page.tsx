import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Gift, Coins, CheckCircle2, AlertCircle, Clock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import React from "react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { UnauthenticatedPage } from "@/components/ui/unauthenticated-page.tsx";

export default function Rewards() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <RewardsContent />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedPage />
      </Unauthenticated>
    </>
  );
}

function RewardsContent() {
  const steamProfile = useQuery(api.profiles.getSteamProfile);
  const rewards = useQuery(api.rewards.getAvailableRewards);
  const redemptions = useQuery(api.rewards.getUserRedemptions);
  const currentUser = useQuery(api.users.getCurrentUser);
  const redeemReward = useMutation(api.rewards.redeemReward);
  const revealCode = useMutation(api.rewards.revealCode);
  const initializeApp = useMutation(api.initializeApp.initializeApp);
  const [redeeming, setRedeeming] = useState<Id<"rewards"> | null>(null);
  const [revealing, setRevealing] = useState<Id<"rewardRedemptions"> | null>(null);

  // Initialize rewards on mount
  React.useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const handleRedeem = async (rewardId: Id<"rewards">) => {
    try {
      setRedeeming(rewardId);
      const result = await redeemReward({ rewardId });
      toast.success(result.message);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Redemption failed", {
          description: error.message,
        });
      }
    } finally {
      setRedeeming(null);
    }
  };

  const handleReveal = async (redemptionId: Id<"rewardRedemptions">) => {
    try {
      setRevealing(redemptionId);
      const result = await revealCode({ redemptionId });
      toast.success("Code Revealed!", {
        description: `Your code: ${result.code}`,
        duration: 15000,
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to reveal code", {
          description: error.message,
        });
      }
    } finally {
      setRevealing(null);
    }
  };

  if (rewards === undefined || redemptions === undefined || currentUser === undefined || steamProfile === undefined) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!steamProfile) {
    return (
      <DashboardLayout>
        <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 text-center space-y-6">
          <Gift className="w-16 h-16 text-[var(--neon-cyan)] mx-auto opacity-50" />
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-2">Steam hesabınızı bağlayın</h2>
            <p className="text-muted-foreground uppercase tracking-wide">
              Ödül mağazasını görmek için Steam hesabınızı bağlamanız gerekiyor
            </p>
          </div>
          <a href="/dashboard">
            <Button className="glass-card border-2 border-[var(--neon-magenta)] hover:neon-glow-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 font-bold uppercase tracking-wider">
              Dashboard'a Git
            </Button>
          </a>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 neon-glow-cyan">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-black/40 border-2 border-[var(--neon-cyan)] flex items-center justify-center neon-glow-cyan">
                <Gift className="w-8 h-8 text-[var(--neon-cyan)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text-cyber tracking-wider uppercase">
                  Rewards Store
                </h1>
                <p className="text-muted-foreground text-sm uppercase tracking-wide mt-1">
                  Redeem points for gift cards
                </p>
              </div>
            </div>
            <div className="glass-card p-4 rounded-sm border-2 border-[var(--neon-magenta)] neon-glow-magenta text-center">
              <div className="flex items-center gap-2 text-3xl font-bold text-[var(--neon-magenta)] justify-center">
                <Coins className="w-7 h-7" />
                {currentUser?.totalPoints || 0}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">Available Points</p>
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const canAfford = (currentUser?.totalPoints || 0) >= reward.pointsCost;
            return (
              <div
                key={reward._id}
                className="glass-card rounded-sm border-2 border-[var(--neon-purple)]/20 overflow-hidden hover-glow-purple transition-all"
              >
                <div className="aspect-video bg-black/40 flex items-center justify-center p-4 border-b-2 border-[var(--neon-purple)]/20">
                  <img 
                    src={reward.imageUrl} 
                    alt={reward.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-lg uppercase tracking-wide text-foreground">{reward.name}</h3>
                      <Badge
                        variant="outline"
                        className="shrink-0 border-[var(--neon-cyan)] text-[var(--neon-cyan)] uppercase tracking-wider"
                      >
                        ${reward.rewardValue}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">
                      {reward.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t-2 border-[var(--neon-purple)]/20">
                    <div className="flex items-center gap-2 text-[var(--neon-purple)] font-bold text-lg">
                      <Coins className="w-5 h-5" />
                      {reward.pointsCost}
                    </div>
                    <Button
                      disabled={!canAfford || redeeming === reward._id}
                      onClick={() => handleRedeem(reward._id)}
                      className="glass-card border-2 border-[var(--neon-magenta)] hover:neon-glow-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 font-bold uppercase tracking-wider"
                      size="sm"
                    >
                      {redeeming === reward._id ? "REDEEMING..." : "REDEEM"}
                    </Button>
                  </div>

                  {!canAfford && (
                    <div className="flex items-center gap-2 text-sm text-destructive font-semibold uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4" />
                      Need {reward.pointsCost - (currentUser?.totalPoints || 0)} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Redemption History */}
        {redemptions.length > 0 && (
          <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-magenta)]/20">
            <h2 className="text-2xl font-bold gradient-text-purple uppercase tracking-wider mb-6">
              Your Redemptions
            </h2>
            <div className="space-y-4">
              {redemptions.map((redemption) => {
                const statusIcon = 
                  redemption.status === "pending" ? <Clock className="w-5 h-5 text-yellow-500" /> :
                  redemption.status === "approved" ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                  <CheckCircle2 className="w-5 h-5 text-[var(--neon-cyan)]" />;
                
                const statusText =
                  redemption.status === "pending" ? "Pending Approval" :
                  redemption.status === "approved" ? "Ready to Reveal" :
                  "Code Revealed";

                return (
                  <div
                    key={redemption._id}
                    className="glass-card p-5 rounded-sm border-2 border-[var(--neon-cyan)]/20 hover-glow-cyan"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {statusIcon}
                        <div className="flex-1">
                          <p className="font-bold text-foreground uppercase tracking-wide">
                            {redemption.rewardName}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wide">
                            {new Date(redemption.redeemedAt).toLocaleDateString()} • {redemption.pointsSpent} points
                          </p>
                          <Badge 
                            variant={redemption.status === "pending" ? "secondary" : redemption.status === "approved" ? "default" : "outline"}
                            className="mt-2 uppercase tracking-wider text-xs"
                          >
                            {statusText}
                          </Badge>
                        </div>
                      </div>

                      {redemption.status === "approved" && (
                        <Button
                          size="sm"
                          disabled={revealing === redemption._id}
                          onClick={() => handleReveal(redemption._id)}
                          className="glass-card border-2 border-[var(--neon-cyan)] hover:neon-glow-cyan text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 font-bold uppercase tracking-wider"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {revealing === redemption._id ? "Revealing..." : "Reveal Code"}
                        </Button>
                      )}
                      
                      {redemption.status === "revealed" && redemption.code && (
                        <div className="text-right">
                          <p className="font-mono text-lg font-bold text-[var(--neon-cyan)] tracking-wider">
                            {redemption.code}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                            Code Revealed
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
