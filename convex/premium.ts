import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

const PREMIUM_PASS_PRICE_SOL = 0.05;
const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Purchase premium pass
export const purchasePremiumPass = mutation({
  args: {
    txHash: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
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
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    const now = Date.now();
    const expiryDate = now + PREMIUM_DURATION_MS;

    // Create premium pass record
    await ctx.db.insert("premiumPasses", {
      userId: user._id,
      txHash: args.txHash,
      purchaseDate: now,
      expiryDate,
      isActive: true,
    });

    // Update user
    await ctx.db.patch(user._id, {
      hasPremiumPass: true,
      premiumPassExpiry: expiryDate,
    });

    return { success: true, expiryDate };
  },
});

// Check if user has active premium pass
export const hasPremiumPass = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return false;
    }

    // Check if premium pass is active and not expired
    if (!user.hasPremiumPass || !user.premiumPassExpiry) {
      return false;
    }

    const now = Date.now();
    if (user.premiumPassExpiry < now) {
      return false;
    }

    return true;
  },
});

// Get premium pass info
export const getPremiumPassInfo = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return null;
    }

    if (!user.hasPremiumPass || !user.premiumPassExpiry) {
      return null;
    }

    const now = Date.now();
    if (user.premiumPassExpiry < now) {
      return null;
    }

    return {
      hasPremiumPass: true,
      expiryDate: user.premiumPassExpiry,
      daysRemaining: Math.ceil((user.premiumPassExpiry - now) / (24 * 60 * 60 * 1000)),
    };
  },
});

// Get premium quests for current month
export const getPremiumQuests = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return null;
    }

    // Check if user has premium pass
    if (!user.hasPremiumPass || !user.premiumPassExpiry || user.premiumPassExpiry < Date.now()) {
      return null;
    }

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const premiumQuests = await ctx.db
      .query("premiumQuests")
      .withIndex("by_month", (q) => q.eq("month", month))
      .first();

    if (!premiumQuests) {
      return { month, quests: [] };
    }

    // Get user progress for each quest
    const userProgress = await ctx.db
      .query("userPremiumQuests")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", user._id).eq("month", month)
      )
      .collect();

    const questsWithProgress = premiumQuests.quests.map((quest) => {
      const progress = userProgress.find((p) => p.questId === quest.id);
      return {
        ...quest,
        progress: progress?.progress || 0,
        completed: progress?.completed || false,
        claimed: progress?.claimed || false,
      };
    });

    return { month, quests: questsWithProgress };
  },
});

// Update premium quest progress
export const updatePremiumQuestProgress = mutation({
  args: {
    questId: v.string(),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
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
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Check if user premium quest exists
    const existingProgress = await ctx.db
      .query("userPremiumQuests")
      .withIndex("by_user_quest_month", (q) =>
        q.eq("userId", user._id).eq("questId", args.questId).eq("month", month)
      )
      .first();

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, {
        progress: args.progress,
        completed: args.progress >= 100,
      });
    } else {
      await ctx.db.insert("userPremiumQuests", {
        userId: user._id,
        questId: args.questId,
        month,
        progress: args.progress,
        completed: args.progress >= 100,
        claimed: false,
      });
    }

    return { success: true };
  },
});

// Claim premium quest reward
export const claimPremiumReward = mutation({
  args: {
    questId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
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
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get quest
    const premiumQuests = await ctx.db
      .query("premiumQuests")
      .withIndex("by_month", (q) => q.eq("month", month))
      .first();

    if (!premiumQuests) {
      throw new ConvexError({
        message: "Premium quests not found",
        code: "NOT_FOUND",
      });
    }

    const quest = premiumQuests.quests.find((q) => q.id === args.questId);
    if (!quest) {
      throw new ConvexError({
        message: "Quest not found",
        code: "NOT_FOUND",
      });
    }

    // Get user progress
    const userProgress = await ctx.db
      .query("userPremiumQuests")
      .withIndex("by_user_quest_month", (q) =>
        q.eq("userId", user._id).eq("questId", args.questId).eq("month", month)
      )
      .first();

    if (!userProgress) {
      throw new ConvexError({
        message: "Quest progress not found",
        code: "NOT_FOUND",
      });
    }

    if (!userProgress.completed) {
      throw new ConvexError({
        message: "Quest not completed",
        code: "BAD_REQUEST",
      });
    }

    if (userProgress.claimed) {
      throw new ConvexError({
        message: "Reward already claimed",
        code: "CONFLICT",
      });
    }

    // Mark as claimed
    await ctx.db.patch(userProgress._id, {
      claimed: true,
      rewardType: quest.rewardType,
      rewardData: quest.rewardData,
    });

    // Add reward to user's collection
    await ctx.db.insert("premiumRewards", {
      userId: user._id,
      rewardType: quest.rewardType,
      rewardData: quest.rewardData,
      earnedAt: Date.now(),
    });

    // If reward is points, add to user points
    if (quest.rewardType === "points") {
      const points = parseInt(quest.rewardData);
      await ctx.db.patch(user._id, {
        totalPoints: user.totalPoints + points,
      });
      await ctx.db.insert("pointHistory", {
        userId: user._id,
        amount: points,
        reason: `Premium Quest: ${quest.title}`,
        timestamp: Date.now(),
      });
    }

    return {
      success: true,
      rewardType: quest.rewardType,
      rewardData: quest.rewardData,
    };
  },
});

// Get user's premium rewards
export const getMyPremiumRewards = query({
  args: {},
  handler: async (ctx, args) => {
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

    const rewards = await ctx.db
      .query("premiumRewards")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return rewards;
  },
});
