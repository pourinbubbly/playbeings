import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Clock, Gamepad2, Trophy, Target, Check } from "lucide-react";
import { toast } from "sonner";

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

  const Icon = ICON_MAP[quest.icon as keyof typeof ICON_MAP] || Target;
  const progressPercentage = Math.min((progress / quest.requirement) * 100, 100);
  const isCompletable = progress >= quest.requirement && !claimed;

  const handleClaim = async () => {
    try {
      const result = await completeQuest({
        questId: quest.id,
        reward: quest.reward,
      });
      
      if (result.boostPercentage > 0) {
        toast.success(`Quest completed!`, {
          description: (
            <div className="space-y-1">
              <p className="font-semibold text-[var(--neon-cyan)]">+{result.boostedPoints} points earned!</p>
              <p className="text-xs text-muted-foreground">
                Base: {result.basePoints} pts + {result.boostPercentage}% NFT boost
              </p>
            </div>
          ),
        });
      } else {
        toast.success(`Quest completed! +${quest.reward} points`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to claim reward");
    }
  };

  return (
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
  );
}
