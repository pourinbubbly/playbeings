import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAvailableRewards = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("rewards")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const redeemReward = mutation({
  args: {
    rewardId: v.id("rewards"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const reward = await ctx.db.get(args.rewardId);
    if (!reward || !reward.isActive) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Reward not found or inactive",
      });
    }

    // Check if user has enough points
    if (user.totalPoints < reward.pointsCost) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Insufficient points",
      });
    }

    // Deduct points
    await ctx.db.patch(user._id, {
      totalPoints: user.totalPoints - reward.pointsCost,
    });

    // Generate a mock code (in production, this would come from an actual API)
    const code = `${reward.rewardType.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Create redemption record
    await ctx.db.insert("rewardRedemptions", {
      userId: user._id,
      rewardName: reward.name,
      pointsSpent: reward.pointsCost,
      code,
      status: "delivered",
      redeemedAt: Date.now(),
    });

    // Record point history
    await ctx.db.insert("pointHistory", {
      userId: user._id,
      amount: -reward.pointsCost,
      reason: `Redeemed: ${reward.name}`,
      timestamp: Date.now(),
    });

    return {
      success: true,
      code,
      message: `Successfully redeemed ${reward.name}!`,
    };
  },
});

export const getUserRedemptions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("rewardRedemptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});
