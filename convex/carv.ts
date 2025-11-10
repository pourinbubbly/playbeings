"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

// CARV API Base URL
const CARV_API_BASE = "https://api.carv.io/data";

// CARV API Client Helper
async function carvApiRequest(endpoint: string, params: Record<string, string> = {}) {
  const apiKey = process.env.CARV_API_KEY;
  if (!apiKey) {
    throw new ConvexError({
      code: "EXTERNAL_SERVICE_ERROR",
      message: "CARV API key not configured",
    });
  }

  const url = new URL(`${CARV_API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
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

// Get user's on-chain identity and reputation
export const getUserIdentity = action({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const data = await carvApiRequest("/identity", {
        address: args.walletAddress,
      });
      
      return {
        carvId: data.carv_id || null,
        reputationScore: data.reputation_score || 0,
        verifiedAt: data.verified_at || null,
        metadata: data.metadata || {},
      };
    } catch (error) {
      console.error("Error fetching CARV identity:", error);
      return null;
    }
  },
});

// Get user's cross-chain activity and behavior patterns
export const getUserBehaviorInsights = action({
  args: {
    walletAddress: v.optional(v.string()),
    steamId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Mock implementation - CARV API documentation needed for exact endpoints
      // This would call CARV's behavior analysis endpoints
      const insights = {
        gamingPreferences: {
          genres: ["action", "strategy", "rpg"],
          playStyle: "competitive",
          averageSessionLength: 120, // minutes
        },
        socialBehavior: {
          engagement: "high",
          communityParticipation: 0.75,
        },
        economicBehavior: {
          spendingPattern: "moderate",
          rewardResponsiveness: 0.8,
        },
      };

      return insights;
    } catch (error) {
      console.error("Error fetching behavior insights:", error);
      return null;
    }
  },
});

// Generate AI-powered game recommendations  
// Note: This is a mock implementation - real CARV integration would use their AI endpoints
export const generateGameRecommendations = internalAction({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // Generate recommendations based on AI analysis
      // This is a simplified version - real implementation would use CARV's AI endpoints
      const recommendations = [
        {
          appId: "730", // CS:GO
          reason: "Popular among competitive players with similar playstyle",
          confidence: 0.85,
        },
        {
          appId: "570", // Dota 2
          reason: "Strategic gameplay matches your preferences",
          confidence: 0.78,
        },
        {
          appId: "252490", // Rust
          reason: "High engagement potential based on your patterns",
          confidence: 0.72,
        },
      ];

      // Store recommendations in database
      for (const rec of recommendations) {
        await ctx.runMutation(internal.carvMutations.storeRecommendationMutation, {
          userId: args.userId,
          type: "game",
          targetId: rec.appId,
          score: rec.confidence,
          reason: rec.reason,
          metadata: "{}",
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

// Generate AI-powered quest recommendations
// Note: This is a mock implementation - real CARV integration would use their AI endpoints
export const generateQuestRecommendations = internalAction({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<Array<{
    questId: string;
    reason: string;
    confidence: number;
    suggestedReward: number;
  }>> => {
    try {
      // Analyze patterns and generate personalized quest recommendations
      const recommendations: Array<{
        questId: string;
        reason: string;
        confidence: number;
        suggestedReward: number;
      }> = [
        {
          questId: "play_competitive",
          reason: "Based on your competitive playstyle",
          confidence: 0.82,
          suggestedReward: 150,
        },
        {
          questId: "social_engagement",
          reason: "High community engagement detected",
          confidence: 0.76,
          suggestedReward: 150,
        },
      ];

      // Store recommendations
      for (const rec of recommendations) {
        await ctx.runMutation(internal.carvMutations.storeRecommendationMutation, {
          userId: args.userId,
          type: "quest",
          targetId: rec.questId,
          score: rec.confidence,
          reason: rec.reason,
          metadata: "{}",
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

// Smart reward optimization based on user behavior
// Note: This is a mock implementation - real CARV integration would use behavioral data
export const optimizeRewardDistribution = internalAction({
  args: {
    userId: v.id("users"),
    baseReward: v.number(),
    context: v.string(), // "quest_complete", "milestone", "engagement"
  },
  handler: async (ctx, args) => {
    try {
      // AI-based reward optimization
      // Factors: user engagement, retention risk, milestone importance
      const multiplier = 1.2; // Base 20% bonus for AI optimization

      const optimizedReward = Math.floor(args.baseReward * multiplier);

      // Log smart reward
      await ctx.runMutation(internal.carvMutations.logSmartRewardMutation, {
        userId: args.userId,
        rewardType: "points",
        amount: optimizedReward,
        reason: `AI-optimized reward (${multiplier.toFixed(2)}x multiplier)`,
        triggeredBy: args.context,
        status: "distributed",
        createdAt: Date.now(),
      });

      return optimizedReward;
    } catch (error) {
      console.error("Error optimizing reward:", error);
      return args.baseReward;
    }
  },
});
