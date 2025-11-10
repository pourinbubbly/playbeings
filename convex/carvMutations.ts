import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Store AI recommendation
export const storeRecommendationMutation = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    targetId: v.string(),
    score: v.number(),
    reason: v.string(),
    metadata: v.string(),
    createdAt: v.number(),
    shown: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiRecommendations", args);
  },
});

// Log smart reward
export const logSmartRewardMutation = internalMutation({
  args: {
    userId: v.id("users"),
    rewardType: v.string(),
    amount: v.number(),
    reason: v.string(),
    triggeredBy: v.string(),
    status: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("smartRewards", args);
  },
});

// Get AI recommendations for user
export const getRecommendations = query({
  args: {
    userId: v.id("users"),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    try {
      let recommendations;
      
      if (args.type !== undefined) {
        // Query with both userId and type using the composite index
        const typeValue: string = args.type;
        recommendations = await ctx.db
          .query("aiRecommendations")
          .withIndex("by_user_and_type", (q) => 
            q.eq("userId", args.userId).eq("type", typeValue)
          )
          .order("desc")
          .take(args.limit || 10);
      } else {
        // Query with just userId
        recommendations = await ctx.db
          .query("aiRecommendations")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .order("desc")
          .take(args.limit || 10);
      }

      return recommendations;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return [];
    }
  },
});

// Mark recommendation as shown
export const markRecommendationShown = mutation({
  args: {
    recommendationId: v.id("aiRecommendations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.recommendationId, {
      shown: true,
    });
  },
});

// Mark recommendation as clicked
export const markRecommendationClicked = mutation({
  args: {
    recommendationId: v.id("aiRecommendations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.recommendationId, {
      clicked: true,
    });
  },
});

// Get user's smart rewards history
export const getSmartRewards = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const rewards = await ctx.db
      .query("smartRewards")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);

    return rewards;
  },
});

// Store or update CARV identity
export const updateCarvIdentity = mutation({
  args: {
    userId: v.id("users"),
    carvId: v.optional(v.string()),
    walletAddress: v.optional(v.string()),
    reputationScore: v.optional(v.number()),
    verifiedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    // Check if identity exists
    const existing = await ctx.db
      .query("carvIdentities")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        carvId: args.carvId,
        walletAddress: args.walletAddress,
        reputationScore: args.reputationScore,
        verifiedAt: args.verifiedAt,
        lastSynced: now,
      });
      return existing._id;
    } else {
      // Create new
      return await ctx.db.insert("carvIdentities", {
        userId: args.userId,
        carvId: args.carvId,
        walletAddress: args.walletAddress,
        reputationScore: args.reputationScore,
        verifiedAt: args.verifiedAt,
        lastSynced: now,
      });
    }
  },
});

// Get CARV identity for user
export const getCarvIdentity = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const carvIdentity = await ctx.db
      .query("carvIdentities")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return carvIdentity;
  },
});

// Store AI insights
export const storeInsight = internalMutation({
  args: {
    userId: v.id("users"),
    insightType: v.string(),
    category: v.string(),
    insight: v.string(),
    confidence: v.number(),
    actionable: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiInsights", {
      ...args,
      generatedAt: Date.now(),
    });
  },
});

// Get AI insights for user
export const getInsights = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const insights = await ctx.db
      .query("aiInsights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 10);

    return insights;
  },
});
