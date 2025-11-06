import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Play } from "lucide-react";
import { toast } from "sonner";

export function SimulateProgress() {
  const [isSimulating, setIsSimulating] = useState(false);
  const updateProgress = useMutation(api.quests.updateQuestProgress);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      // Simulate some random progress for demo purposes
      const questIds = ["quest_0", "quest_1", "quest_2"];
      const randomProgress = [
        Math.floor(Math.random() * 180) + 30,
        Math.floor(Math.random() * 5) + 1,
        Math.floor(Math.random() * 5) + 1,
      ];

      for (let i = 0; i < questIds.length; i++) {
        await updateProgress({
          questId: questIds[i],
          progress: randomProgress[i],
        });
      }

      toast.success("Progress updated! Check your quests above.");
    } catch (error) {
      toast.error("Failed to update progress");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">Demo: Simulate Progress</CardTitle>
        <CardDescription>
          Click to simulate quest progress (for testing purposes)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleSimulate}
          disabled={isSimulating}
          variant="secondary"
          className="w-full"
        >
          <Play className="w-4 h-4 mr-2" />
          {isSimulating ? "Simulating..." : "Simulate Game Activity"}
        </Button>
      </CardContent>
    </Card>
  );
}
