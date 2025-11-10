import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Clock, Gamepad2, Trophy, Target, Check } from "lucide-react";
import { toast } from "sonner";
import { Celebration } from "@/components/ui/celebration.tsx";
import { completeQuestTransaction } from "@/lib/wallet.ts";
import { checkWalletConnection } from "@/lib/wallet-check.ts";

interface QuestCardProps {
  quest: {
    id: string;
    type: string;
    title: string;
    description: string;
    requirement: number;
    reward: number;
    icon: string;
  };
  progress: number;
  completed: boolean;
  claimed: boolean;
}

const ICON_MAP = {
  clock: Clock,
  gamepad: Gamepad2,
  trophy: Trophy,
  target: Target,
};

export function QuestCard({ quest, progress, completed, claimed }: QuestCardProps) {
  const completeQuest = useMutation(api.quests.completeQuest);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPoints, setCelebrationPoints] = useState(0);

  const Icon = ICON_MAP[quest.icon as keyof typeof ICON_MAP] || Target;
  const progressPercentage = Math.min((progress / quest.requirement) * 100, 100);
  const isCompletable = progress >= quest.requirement && !claimed;

  const handleClaim = async () => {
    try {
      // Check if Backpack wallet is connected
<<<<<<< HEAD
      if (!checkWalletConnection()) {
=======
      if (!window.backpack?.publicKey) {
        toast.error("Wallet not connected", {
          description: "Please connect your Backpack wallet first",
        });
>>>>>>> e2316a1d8368855da6a56687891a143941741f71
        return;
      }

      toast.info("Approve transaction in Backpack", {
        description: "Confirm the quest completion transaction",
      });
      
      // First, create blockchain transaction
      const { signature, explorerUrl } = await completeQuestTransaction(
        quest.title,
        quest.reward
      );

      // Show immediate success
      toast.success("Transaction submitted!", {
        description: "Recording quest completion...",
      });

      // Then, complete quest in database with tx signature
      const result = await completeQuest({
        questId: quest.id,
        questTitle: quest.title,
        reward: quest.reward,
        requirement: quest.requirement,
        txSignature: signature,
      });
      
      // Show celebration
      setCelebrationPoints(result.boostedPoints);
      setShowCelebration(true);
      
      toast.success(`Quest completed! +${result.boostedPoints} points`, {
        description: "View on CARV Explorer",
        action: {
          label: "View TX",
          onClick: () => window.open(explorerUrl, "_blank"),
        },
      });
    } catch (error) {
      console.error("Quest claim error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("Plugin Closed") || error.message.includes("User rejected")) {
          toast.error("Transaction cancelled", {
            description: "You cancelled the transaction in your wallet",
          });
        } else if (error.message.includes("Wallet not connected")) {
          toast.error("Wallet not connected", {
            description: "Please connect your Backpack wallet first",
          });
        } else if (error.message.includes("already claimed")) {
          toast.error("Already claimed", {
            description: "You already claimed this quest reward",
          });
        } else if (error.message.includes("not completed yet")) {
          toast.error("Quest not complete", {
            description: "You haven't met the quest requirements yet",
          });
        } else {
          toast.error("Failed to claim reward", {
            description: "Please try again or refresh the page",
          });
        }
      } else {
        toast.error("Failed to claim reward", {
          description: "An unexpected error occurred",
        });
      }
    }
  };

  return (
    <>
      <Celebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title="Quest Complete!"
        message={quest.title}
        type="quest"
        points={celebrationPoints}
      />
      
      <Card className={claimed ? "bg-muted/50" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <Badge variant={claimed ? "secondary" : "default"}>
            +{quest.reward} pts
          </Badge>
        </div>
        <CardTitle className="text-lg">{quest.title}</CardTitle>
        <CardDescription>{quest.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {Math.min(progress, quest.requirement)} / {quest.requirement}
            </span>
          </div>
          <Progress value={progressPercentage} />
        </div>

        {claimed ? (
          <Button disabled className="w-full">
            <Check className="w-4 h-4 mr-2" />
            Completed
          </Button>
        ) : isCompletable ? (
          <Button onClick={handleClaim} className="w-full">
            Claim Reward
          </Button>
        ) : (
          <Button disabled variant="secondary" className="w-full">
            {progressPercentage.toFixed(0)}% Complete
          </Button>
        )}
      </CardContent>
    </Card>
    </>
  );
}
