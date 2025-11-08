import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Calendar, Flame, Trophy, Zap, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { performDailyCheckInTransaction, getConnectedWallet } from "@/lib/wallet.ts";
import { Celebration } from "@/components/ui/celebration.tsx";

export function DailyCheckInCard() {
  const checkInStatus = useQuery(api.checkin.getCheckInStatus);
  const checkInHistory = useQuery(api.checkin.getCheckInHistory);
  const performCheckIn = useMutation(api.checkin.performCheckIn);
  const updateTxStatus = useMutation(api.checkin.updateCheckInTxStatus);
  
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPoints, setCelebrationPoints] = useState(0);

  // Show loading state while data is loading
  if (checkInStatus === undefined) {
    return (
      <Card className="glass-card border-2 border-[var(--neon-purple)]/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-black/40 border-2 border-[var(--neon-purple)] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[var(--neon-purple)]" />
            </div>
            <div>
              <CardTitle className="text-xl text-[var(--neon-purple)] uppercase tracking-wider">
                Daily Check-In
              </CardTitle>
              <CardDescription className="uppercase tracking-wide text-xs">
                Loading...
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-4 border border-[var(--neon-cyan)]/20 h-24 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCheckIn = async () => {
    const walletAddress = getConnectedWallet();
    
    if (!walletAddress) {
      toast.error("Wallet not connected", {
        description: "Please connect your Backpack wallet first",
      });
      return;
    }

    setIsCheckingIn(true);
    
    try {
      // Show transaction prompt
      toast.info("Approve transaction in Backpack", {
        description: "Confirm the check-in transaction to continue",
      });

      // Perform CARV SVM transaction
      const { signature, explorerUrl } = await performDailyCheckInTransaction();
      
      console.log("Check-in transaction submitted:", signature);

      // Show success toast immediately after transaction is submitted
      toast.success("Transaction submitted successfully!", {
        description: "Recording your check-in...",
      });

      // Record check-in in database
      const result = await performCheckIn({ txHash: signature });

      // Show celebration
      setCelebrationPoints(result.points);
      setShowCelebration(true);

      // Update transaction status
      const today = new Date().toISOString().split("T")[0];
      await updateTxStatus({ date: today, status: "confirmed" });

    } catch (error) {
      console.error("Check-in error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("Already checked in")) {
          toast.error("Already checked in today");
        } else if (error.message.includes("Plugin Closed") || error.message.includes("User rejected")) {
          toast.error("Transaction cancelled", {
            description: "You cancelled the transaction in your wallet",
          });
        } else if (error.message.includes("Wallet not connected")) {
          toast.error("Wallet not connected", {
            description: "Please connect your Backpack wallet first",
          });
        } else {
          toast.error("Check-in failed", {
            description: "Please try again or refresh the page",
          });
        }
      } else {
        toast.error("Failed to check in", {
          description: "An unexpected error occurred",
        });
      }
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <>
      <Celebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title="Congratulations!"
        message={`Day ${checkInStatus?.currentStreak || 1} streak! Keep it going!`}
        type="checkin"
        points={celebrationPoints}
      />
      
      <Card className="glass-card border-2 border-[var(--neon-purple)]/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-black/40 border-2 border-[var(--neon-purple)] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[var(--neon-purple)]" />
            </div>
            <div>
              <CardTitle className="text-xl text-[var(--neon-purple)] uppercase tracking-wider">
                Daily Check-In
              </CardTitle>
              <CardDescription className="uppercase tracking-wide text-xs">
                Earn points & build your streak
              </CardDescription>
            </div>
          </div>
          
          {checkInStatus.hasCheckedInToday && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--neon-cyan)]/20 border border-[var(--neon-cyan)]/30">
              <Check className="w-4 h-4 text-[var(--neon-cyan)]" />
              <span className="text-xs font-semibold text-[var(--neon-cyan)] uppercase tracking-wider">
                Completed
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 border border-[var(--neon-cyan)]/20 text-center">
            <div className="flex items-center justify-center mb-2">
              <Flame className="w-5 h-5 text-[var(--neon-cyan)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--neon-cyan)]">
              {checkInStatus.currentStreak}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Current Streak
            </p>
          </div>

          <div className="glass-card p-4 border border-[var(--neon-magenta)]/20 text-center">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-[var(--neon-magenta)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--neon-magenta)]">
              {checkInStatus.longestStreak}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Best Streak
            </p>
          </div>

          <div className="glass-card p-4 border border-[var(--neon-purple)]/20 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-[var(--neon-purple)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--neon-purple)]">
              +{checkInStatus.nextCheckInPoints}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
              Next Reward
            </p>
          </div>
        </div>

        {/* Check-in Button */}
        <Button
          onClick={handleCheckIn}
          disabled={!checkInStatus.canCheckIn || isCheckingIn}
          className={
            checkInStatus.hasCheckedInToday
              ? "w-full glass-card border-2 border-[var(--neon-cyan)]/30 text-[var(--neon-cyan)] font-bold uppercase tracking-wider py-6 cursor-not-allowed opacity-60"
              : "w-full glass-card border-2 border-[var(--neon-purple)] text-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/20 hover:neon-glow-purple font-bold uppercase tracking-wider py-6"
          }
        >
          {isCheckingIn ? (
            <>
              <Zap className="w-5 h-5 mr-2 animate-pulse" />
              Processing Transaction...
            </>
          ) : checkInStatus.hasCheckedInToday ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Checked In Today
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Check In Now
            </>
          )}
        </Button>

        {/* Info */}
        {!checkInStatus.hasCheckedInToday && (
          <div className="glass-card p-3 border border-[var(--neon-cyan)]/20">
            <p className="text-xs text-muted-foreground uppercase tracking-wide text-center">
              Check in daily to maintain your streak and earn bonus points!
              <br />
              <span className="text-[var(--neon-cyan)]">
                +5 points per week of streak (max +50)
              </span>
            </p>
          </div>
        )}

        {/* Recent Check-ins Calendar */}
        {checkInHistory && checkInHistory.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Activity
            </h4>
            <div className="grid grid-cols-7 gap-2">
              {checkInHistory.slice(0, 14).map((checkIn) => (
                <div
                  key={checkIn._id}
                  className="aspect-square glass-card border border-[var(--neon-cyan)]/30 rounded flex flex-col items-center justify-center p-1 hover:border-[var(--neon-cyan)]/60 transition-all cursor-pointer group"
                  title={`${new Date(checkIn.createdAt).toLocaleDateString()} - Day ${checkIn.streakDay} - ${checkIn.points} points`}
                >
                  <div className="text-[var(--neon-cyan)] text-xs font-bold">
                    {new Date(checkIn.createdAt).getDate()}
                  </div>
                  <Flame className="w-3 h-3 text-[var(--neon-cyan)]/50 group-hover:text-[var(--neon-cyan)] transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
  );
}
