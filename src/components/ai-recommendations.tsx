import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Sparkles, TrendingUp, Target, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton.tsx";

import type { Id } from "@/convex/_generated/dataModel.d.ts";

interface Recommendation {
  _id: Id<"aiRecommendations">;
  type: string;
  targetId: string;
  score: number;
  reason: string;
  shown: boolean;
}

interface Insight {
  _id: Id<"aiInsights">;
  insightType: string;
  category: string;
  insight: string;
  confidence: number;
}

export function AIRecommendations({ userId }: { userId: Id<"users"> }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const generateRecommendations = useAction(api.carv.generateGameRecommendations);
  const generateQuests = useAction(api.carv.generateQuestRecommendations);
  
  const recommendations = useQuery(api.carvMutations.getRecommendations, {
    userId: userId,
    limit: 5,
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await Promise.all([
        generateRecommendations({ userId }),
        generateQuests({ userId, limit: 3 }),
      ]);
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (recommendations === undefined) {
    return (
      <Card className="glass-card border-2 border-[var(--neon-cyan)]/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[var(--neon-cyan)]" />
            <div>
              <CardTitle className="text-xl text-[var(--neon-cyan)] uppercase tracking-wider">
                AI Recommendations
              </CardTitle>
              <CardDescription className="uppercase tracking-wide text-xs">
                Powered by CARV D.A.T.A.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="glass-card border-2 border-[var(--neon-cyan)]/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[var(--neon-cyan)]" />
            <div>
              <CardTitle className="text-xl text-[var(--neon-cyan)] uppercase tracking-wider">
                AI Recommendations
              </CardTitle>
              <CardDescription className="uppercase tracking-wide text-xs">
                Powered by CARV D.A.T.A. Framework
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm mb-4">
              Get personalized recommendations using CARV on-chain data
            </p>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="bg-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/80 text-black"
            >
              {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isGenerating ? "Analyzing..." : "Generate Recommendations"}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Powered by CARV D.A.T.A. Framework + Real Steam Data
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
            <Sparkles className="w-6 h-6 text-[var(--neon-cyan)]" />
            <div>
              <CardTitle className="text-xl text-[var(--neon-cyan)] uppercase tracking-wider">
                AI Recommendations
              </CardTitle>
              <CardDescription className="uppercase tracking-wide text-xs">
                CARV D.A.T.A. Framework
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="border-[var(--neon-cyan)]/20 hover:border-[var(--neon-cyan)]/40"
            >
              {isGenerating && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              {isGenerating ? "Updating..." : "Refresh"}
            </Button>
            <Badge variant="secondary" className="bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/20">
              {recommendations.length} Active
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec: Recommendation) => (
            <RecommendationCard key={rec._id} recommendation={rec} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "quest":
        return <Target className="w-5 h-5" />;
      case "game":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getColor = (score: number) => {
    if (score >= 0.8) return "text-[var(--neon-cyan)]";
    if (score >= 0.6) return "text-[var(--neon-magenta)]";
    return "text-[var(--neon-purple)]";
  };

  const confidencePercentage = Math.round(recommendation.score * 100);

  return (
    <div className="glass-card p-4 border border-[var(--neon-purple)]/20 hover:border-[var(--neon-cyan)]/40 transition-all">
      <div className="flex items-start gap-3">
        <div className={`${getColor(recommendation.score)} flex-shrink-0 mt-1`}>
          {getIcon(recommendation.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <Badge variant="outline" className="text-xs uppercase tracking-wider">
              {recommendation.type}
            </Badge>
            <span className={`text-xs font-semibold ${getColor(recommendation.score)}`}>
              {confidencePercentage}% match
            </span>
          </div>
          <p className="text-sm text-foreground mb-1 font-medium">
            {recommendation.reason}
          </p>
          <p className="text-xs text-muted-foreground">
            Based on your gaming patterns and preferences
          </p>
        </div>
      </div>
    </div>
  );
}

export function AIInsights({ userId }: { userId: Id<"users"> }) {
  const insights = useQuery(api.carvMutations.getInsights, {
    userId: userId,
    limit: 3,
  });

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card border-2 border-[var(--neon-purple)]/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-[var(--neon-purple)]" />
          <div>
            <CardTitle className="text-xl text-[var(--neon-purple)] uppercase tracking-wider">
              AI Insights
            </CardTitle>
            <CardDescription className="uppercase tracking-wide text-xs">
              Behavioral Analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight: Insight) => (
            <div
              key={insight._id}
              className="glass-card p-3 border border-[var(--neon-purple)]/20"
            >
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs uppercase mt-0.5">
                  {insight.category}
                </Badge>
                <p className="text-sm text-foreground flex-1">{insight.insight}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
