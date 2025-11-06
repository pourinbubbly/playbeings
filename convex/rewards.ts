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

    // Create redemption record (pending admin approval)
    const redemptionId = await ctx.db.insert("rewardRedemptions", {
      userId: user._id,
      rewardId: args.rewardId,
      rewardName: reward.name,
      pointsSpent: reward.pointsCost,
      status: "pending",
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
      redemptionId,
      message: `Successfully redeemed ${reward.name}! Awaiting admin approval.`,
    };
  },
});

export const approveRedemption = mutation({
  args: {
    redemptionId: v.id("rewardRedemptions"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const redemption = await ctx.db.get(args.redemptionId);
    
    if (!redemption) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Redemption not found",
      });
    }

    if (redemption.status !== "pending") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Redemption already processed",
      });
    }

    await ctx.db.patch(args.redemptionId, {
      code: args.code,
      status: "approved",
    });

    return { success: true };
  },
});

export const revealCode = mutation({
  args: {
    redemptionId: v.id("rewardRedemptions"),
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

    const redemption = await ctx.db.get(args.redemptionId);
    
    if (!redemption) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Redemption not found",
      });
    }

    if (redemption.userId !== user._id) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Not authorized",
      });
    }

    if (redemption.status !== "approved") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: redemption.status === "pending" 
          ? "Code not yet approved by admin" 
          : "Code already revealed",
      });
    }

    await ctx.db.patch(args.redemptionId, {
      status: "revealed",
    });

    return {
      success: true,
      code: redemption.code || "",
    };
  },
});

export const getPendingRedemptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("rewardRedemptions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
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
