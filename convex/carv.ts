"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal, api } from "./_generated/api";

// CARV D.A.T.A. Framework API Base URL
const CARV_API_BASE = "https://interface.carv.io/ai-agent-backend";
// OpenRouter API Base URL (OpenAI compatible, supports free DeepSeek models)
const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

// CARV API Client Helper
async function carvApiRequest(
  endpoint: string, 
  params: Record<string, string> = {},
  method: "GET" | "POST" = "GET",
  body?: unknown
) {
  const apiKey = process.env.CARV_API_KEY;
  if (!apiKey) {
    throw new ConvexError({
      code: "EXTERNAL_SERVICE_ERROR",
      message: "CARV API key not configured",
    });
  }

  const url = new URL(`${CARV_API_BASE}${endpoint}`);
  if (method === "GET") {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CARV API error (${response.status}):`, errorText);
      throw new Error(`CARV API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("CARV API request error:", error);
    throw new ConvexError({
      code: "EXTERNAL_SERVICE_ERROR",
      message: error instanceof Error ? error.message : "CARV API request failed",
    });
  }
}

// OpenRouter AI Client Helper (supports free DeepSeek models)
async function deepseekRequest(messages: Array<{ role: string; content: string }>) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OpenRouter API key not configured, using fallback logic");
    return null;
  }

  try {
    const response = await fetch(`${OPENROUTER_API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://playbeings.app",
        "X-Title": "PlayBeings",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1", // Advanced reasoning model on OpenRouter
        messages,
        temperature: 0.7,
        max_tokens: 800, // Reduced for faster response
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenRouter API request error:", error);
    return null;
  }
}

// Get user's on-chain identity and reputation from CARV
export const getUserIdentity = action({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Call CARV API for on-chain identity
      const data = await carvApiRequest("/token_info", {
        address: args.walletAddress,
      });
      
      return {
        carvId: data.data?.carv_id || null,
        reputationScore: data.data?.reputation_score || 0,
        verifiedAt: data.data?.verified_at || null,
        metadata: data.data?.metadata || {},
      };
    } catch (error) {
      console.error("Error fetching CARV identity:", error);
      return null;
    }
  },
});

// Real-time behavioral analytics using Steam data + DeepSeek AI
export const analyzeBehaviorWithAI = internalAction({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<{
    gamingPreferences: {
      genres: string[];
      playStyle: string;
      sessionLength: number;
    };
    engagement: {
      level: "low" | "medium" | "high";
      trend: "increasing" | "stable" | "decreasing";
    };
    recommendations: {
      nextQuest: string;
      suggestedGame: string;
      rewardMultiplier: number;
    };
    insights: string[];
    carvData?: {
      carvId: string | null;
      reputationScore: number;
    };
  } | null> => {
    try {
      // Get user data from database
      const user = await ctx.runQuery(api.users.getUserById, { userId: args.userId });
      if (!user) return null;

      // Get CARV on-chain identity if wallet connected
      let carvData = null;
      const wallet = await ctx.runQuery(internal.wallets.getUserWallet, { userId: args.userId });
      if (wallet?.walletAddress) {
        try {
          const carvIdentity = await ctx.runAction(api.carv.getUserIdentity, {
            walletAddress: wallet.walletAddress,
          });
          if (carvIdentity) {
            carvData = {
              carvId: carvIdentity.carvId,
              reputationScore: carvIdentity.reputationScore,
            };
          }
        } catch (error) {
          console.log("CARV identity fetch skipped:", error);
        }
      }

      // Get user's games
      const games = await ctx.runQuery(internal.steamQueries.getUserGames, { userId: args.userId });
      
      // Get user's recent quests
      const recentQuests = await ctx.runQuery(internal.quests.getUserRecentQuests, { 
        userId: args.userId, 
        limit: 10 
      });

      // Prepare data for AI analysis
      const analysisPrompt = `Analyze gaming user behavior. Respond ONLY with valid JSON, no markdown:

Stats:
- Points: ${user.totalPoints}, Level: ${user.level}
- Games: ${games?.length || 0}
- Top 3: ${games?.slice(0, 3).map((g: { name: string; playtime: number }) => `${g.name}(${g.playtime}m)`).join(", ")}
- Quest Rate: ${recentQuests?.filter((q: { completed: boolean }) => q.completed).length || 0}/${recentQuests?.length || 0}
${carvData ? `- CARV ID: ${carvData.carvId || "none"}, Rep: ${carvData.reputationScore}` : ""}

Return JSON:
{
  "gamingPreferences": {"genres": ["action"], "playStyle": "casual", "sessionLength": 60},
  "engagement": {"level": "medium", "trend": "stable"},
  "recommendations": {"nextQuest": "Play 1h", "suggestedGame": "CS2", "rewardMultiplier": 1.2},
  "insights": ["insight1", "insight2"]
}`;

      // Get AI insights from DeepSeek R1 + CARV
      const aiResponse = await deepseekRequest([
        {
          role: "system",
          content: "Return only valid JSON, no markdown.",
        },
        {
          role: "user",
          content: analysisPrompt,
        },
      ]);

      let insights;
      if (aiResponse) {
        try {
          insights = JSON.parse(aiResponse);
          // Add CARV data to AI insights
          if (carvData) {
            insights.carvData = carvData;
          }
        } catch {
          console.warn("Failed to parse AI response, using fallback");
          insights = null;
        }
      }

      // Fallback to rule-based analysis if AI fails
      if (!insights) {
        const totalPlaytime = games?.reduce((sum: number, g: { playtime: number }) => sum + g.playtime, 0) || 0;
        const avgSessionLength: number = totalPlaytime / Math.max(games?.length || 1, 1);
        
        insights = {
          gamingPreferences: {
            genres: ["action", "strategy"],
            playStyle: avgSessionLength > 120 ? "hardcore" : "casual",
            sessionLength: Math.round(avgSessionLength),
          },
          engagement: {
            level: user.totalPoints > 1000 ? "high" : user.totalPoints > 500 ? "medium" : "low",
            trend: "stable",
          },
          recommendations: {
            nextQuest: "Complete 3 matches",
            suggestedGame: "New competitive title",
            rewardMultiplier: 1.2,
          },
          insights: [
            `Total playtime: ${totalPlaytime} minutes`,
            `Playing ${games?.length || 0} different games`,
            `Quest completion rate: ${Math.round(((recentQuests?.filter((q: { completed: boolean }) => q.completed).length || 0) / Math.max(recentQuests?.length || 1, 1)) * 100)}%`,
            ...(carvData?.carvId ? [`CARV ID: ${carvData.carvId}, Reputation: ${carvData.reputationScore}`] : []),
          ],
          ...(carvData && { carvData }),
        };
      }

      // Store insights in database
      await ctx.runMutation(internal.carvMutations.storeInsight, {
        userId: args.userId,
        insightType: "behavior",
        category: "gaming",
        insight: JSON.stringify(insights),
        confidence: 0.85,
        actionable: true,
      });

      return insights;
    } catch (error) {
      console.error("Error analyzing behavior:", error);
      return null;
    }
  },
});

// AI-powered game recommendations using DeepSeek + Steam data
export const generateGameRecommendations = action({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Array<{
    appId: string;
    name: string;
    reason: string;
    confidence: number;
  }>> => {
    try {
      // Get behavioral insights first
      const behavior = await ctx.runAction(internal.carv.analyzeBehaviorWithAI, {
        userId: args.userId,
      });

      // Get user's current games
      const games = await ctx.runQuery(internal.steamQueries.getUserGames, { userId: args.userId });
      const topGames = games?.slice(0, 5).map((g: { name: string }) => g.name).join(", ") || "No games yet";

      // Use AI to generate personalized recommendations
      const recommendPrompt = `Recommend ${args.limit || 5} Steam games. JSON array only:

User: ${topGames}, ${behavior?.gamingPreferences?.playStyle || "casual"}, ${behavior?.engagement?.level || "medium"}
${behavior?.carvData?.carvId ? `CARV: ${behavior.carvData.carvId}` : ""}

[{"appId":"730","name":"CS2","reason":"Match playstyle","confidence":0.85}]`;

      const aiResponse = await deepseekRequest([
        {
          role: "system",
          content: "Return only valid JSON array, no markdown.",
        },
        {
          role: "user",
          content: recommendPrompt,
        },
      ]);

      let recommendations: Array<{
        appId: string;
        name: string;
        reason: string;
        confidence: number;
      }> = [];

      if (aiResponse) {
        try {
          const parsed = JSON.parse(aiResponse);
          recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || [];
        } catch {
          console.warn("Failed to parse AI recommendations, using fallback");
        }
      }

      // Fallback recommendations if AI fails
      if (recommendations.length === 0) {
        recommendations = [
          {
            appId: "730",
            name: "Counter-Strike 2",
            reason: "Popular competitive FPS with active community",
            confidence: 0.85,
          },
          {
            appId: "570",
            name: "Dota 2",
            reason: "Strategic MOBA with deep gameplay",
            confidence: 0.78,
          },
          {
            appId: "1172470",
            name: "Apex Legends",
            reason: "Fast-paced battle royale",
            confidence: 0.75,
          },
          {
            appId: "252490",
            name: "Rust",
            reason: "Survival game with social elements",
            confidence: 0.72,
          },
          {
            appId: "1623730",
            name: "Palworld",
            reason: "Trending multiplayer adventure",
            confidence: 0.70,
          },
        ].slice(0, args.limit || 5);
      }

      // Store recommendations in database
      for (const rec of recommendations.slice(0, args.limit || 5)) {
        await ctx.runMutation(internal.carvMutations.storeRecommendationMutation, {
          userId: args.userId,
          type: "game",
          targetId: String(rec.appId || rec.name),
          score: rec.confidence || 0.75,
          reason: rec.reason,
          metadata: JSON.stringify({ name: rec.name }),
          createdAt: Date.now(),
          shown: false,
        });
      }

      return recommendations;
    } catch (error) {
      console.error("Error generating game recommendations:", error);
      return [];
    }
  },
});

// AI-powered quest recommendations using DeepSeek
export const generateQuestRecommendations = action({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<Array<{
    questId: string;
    title: string;
    reason: string;
    confidence: number;
    suggestedReward: number;
  }>> => {
    try {
      // Get behavioral insights
      const behavior = await ctx.runAction(internal.carv.analyzeBehaviorWithAI, {
        userId: args.userId,
      });

      // Get available daily quests
      const today = new Date().toISOString().split("T")[0];
      const dailyQuests = await ctx.runQuery(internal.quests.getDailyQuests, { date: today });

      const questPrompt = `Recommend ${args.limit || 3} gaming quests. JSON array only:

User: ${behavior?.gamingPreferences?.playStyle || "casual"}, ${behavior?.engagement?.level || "medium"}, ${behavior?.gamingPreferences?.sessionLength || 60}m
${behavior?.carvData?.carvId ? `CARV: ${behavior.carvData.carvId}` : ""}

[{"questId":"q1","title":"Play 1h","reason":"Fits schedule","confidence":0.8,"suggestedReward":100}]`;

      const aiResponse = await deepseekRequest([
        {
          role: "system",
          content: "Return only valid JSON array, no markdown.",
        },
        {
          role: "user",
          content: questPrompt,
        },
      ]);

      let recommendations: Array<{
        questId: string;
        title: string;
        reason: string;
        confidence: number;
        suggestedReward: number;
      }> = [];

      if (aiResponse) {
        try {
          const parsed = JSON.parse(aiResponse);
          recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || [];
        } catch {
          console.warn("Failed to parse AI quest recommendations");
        }
      }

      // Fallback recommendations
      if (recommendations.length === 0) {
        const playStyle: string = behavior?.gamingPreferences?.playStyle || "casual";
        recommendations = [
          {
            questId: `${playStyle}_play_${Date.now()}`,
            title: playStyle === "hardcore" ? "Play for 2 hours" : "Play for 30 minutes",
            reason: `Matches your ${playStyle} playstyle`,
            confidence: 0.85,
            suggestedReward: playStyle === "hardcore" ? 200 : 100,
          },
          {
            questId: `achievement_${Date.now()}`,
            title: "Unlock 2 achievements",
            reason: "Build your collection",
            confidence: 0.75,
            suggestedReward: 150,
          },
          {
            questId: `social_${Date.now()}`,
            title: "Comment on a profile",
            reason: "Increase community engagement",
            confidence: 0.70,
            suggestedReward: 100,
          },
        ].slice(0, args.limit || 3);
      }

      // Store recommendations
      for (const rec of recommendations.slice(0, args.limit || 3)) {
        await ctx.runMutation(internal.carvMutations.storeRecommendationMutation, {
          userId: args.userId,
          type: "quest",
          targetId: rec.questId || rec.title,
          score: rec.confidence || 0.75,
          reason: rec.reason,
          metadata: JSON.stringify({ 
            title: rec.title, 
            reward: rec.suggestedReward 
          }),
          createdAt: Date.now(),
          shown: false,
        });
      }

      return recommendations;
    } catch (error) {
      console.error("Error generating quest recommendations:", error);
      return [];
    }
  },
});

// Autonomous reward distribution with AI optimization
export const optimizeRewardDistribution = internalAction({
  args: {
    userId: v.id("users"),
    baseReward: v.number(),
    context: v.string(), // "quest_complete", "milestone", "engagement"
  },
  handler: async (ctx, args) => {
    try {
      // Get user data and behavior
      const user = await ctx.runQuery(api.users.getUserById, { userId: args.userId });
      if (!user) return args.baseReward;

      const behavior = await ctx.runAction(internal.carv.analyzeBehaviorWithAI, {
        userId: args.userId,
      });

      // Calculate AI-optimized multiplier
      let multiplier = 1.0;

      // Factor 1: Engagement level (0.8x - 1.3x)
      const engagementBonus = {
        high: 1.3,
        medium: 1.1,
        low: 0.9,
      };
      multiplier *= engagementBonus[behavior?.engagement?.level as keyof typeof engagementBonus] || 1.0;

      // Factor 2: Trend (additional 10% if improving)
      if (behavior?.engagement?.trend === "increasing") {
        multiplier *= 1.1;
      }

      // Factor 3: Context-specific multipliers
      const contextBonus = {
        milestone: 1.5,
        quest_complete: 1.2,
        engagement: 1.1,
        daily_checkin: 1.0,
      };
      multiplier *= contextBonus[args.context as keyof typeof contextBonus] || 1.0;

      // Factor 4: Premium pass bonus
      if (user.hasPremiumPass && (user.premiumPassExpiry || 0) > Date.now()) {
        multiplier *= 1.15;
      }

      // Calculate optimized reward
      const optimizedReward = Math.floor(args.baseReward * multiplier);
      const bonusAmount = optimizedReward - args.baseReward;

      // Log smart reward distribution
      await ctx.runMutation(internal.carvMutations.logSmartRewardMutation, {
        userId: args.userId,
        rewardType: "points",
        amount: optimizedReward,
        reason: `AI-optimized: ${multiplier.toFixed(2)}x multiplier (Engagement: ${behavior?.engagement?.level}, Context: ${args.context}, Bonus: +${bonusAmount})`,
        triggeredBy: args.context,
        status: "distributed",
        createdAt: Date.now(),
      });

      // Autonomous notification - Log in console for now
      console.log(`Smart reward notification: User ${args.userId} earned ${optimizedReward} points (${bonusAmount > 0 ? "+" + bonusAmount + " AI bonus" : "base"})`);

      return optimizedReward;
    } catch (error) {
      console.error("Error optimizing reward:", error);
      return args.baseReward;
    }
  },
});
