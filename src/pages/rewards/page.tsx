import { Authenticated, AuthLoading } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Gift, Coins, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

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
    </>
  );
}

function RewardsContent() {
  const rewards = useQuery(api.rewards.getAvailableRewards);
  const redemptions = useQuery(api.rewards.getUserRedemptions);
  const currentUser = useQuery(api.users.getCurrentUser);
  const redeemReward = useMutation(api.rewards.redeemReward);
  const [redeeming, setRedeeming] = useState<Id<"rewards"> | null>(null);

  const handleRedeem = async (rewardId: Id<"rewards">) => {
    try {
      setRedeeming(rewardId);
      const result = await redeemReward({ rewardId });
      toast.success(result.message, {
        description: `Your code: ${result.code}`,
        duration: 10000,
      });
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

  if (rewards === undefined || redemptions === undefined || currentUser === undefined) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Rewards Store
                </CardTitle>
                <CardDescription className="mt-1">
                  Redeem your points for gift cards and rewards
                </CardDescription>
              </div>
              <div className="text-left md:text-right">
                <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                  <Coins className="w-6 h-6" />
                  {currentUser?.totalPoints || 0}
                </div>
                <p className="text-sm text-muted-foreground">Available Points</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => {
            const canAfford = (currentUser?.totalPoints || 0) >= reward.pointsCost;
            return (
              <Card
                key={reward._id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-6">
                  <Gift className="w-16 h-16 text-primary" />
                </div>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-xl">{reward.name}</h3>
                      <Badge
                        variant={canAfford ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        ${reward.rewardValue}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reward.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Coins className="w-5 h-5" />
                      {reward.pointsCost}
                    </div>
                    <Button
                      disabled={!canAfford || redeeming === reward._id}
                      onClick={() => handleRedeem(reward._id)}
                      size="sm"
                    >
                      {redeeming === reward._id ? "Redeeming..." : "Redeem"}
                    </Button>
                  </div>

                  {!canAfford && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4" />
                      Need {reward.pointsCost - (currentUser?.totalPoints || 0)} more points
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Redemption History */}
        {redemptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Recent Redemptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {redemptions.slice(0, 5).map((redemption) => (
                  <div
                    key={redemption._id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-semibold">{redemption.rewardName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(redemption.redeemedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold">{redemption.code}</p>
                      <p className="text-xs text-muted-foreground">
                        -{redemption.pointsSpent} points
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
