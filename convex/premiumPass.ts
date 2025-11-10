import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

// Check if user has active premium pass
export const hasActivePremiumPass = query({
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

    const now = Date.now();
    const pass = await ctx.db
      .query("premiumPasses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.gt(q.field("expiryDate"), now)
        )
      )
      .first();

    return !!pass;
  },
});

// Get user's premium pass info
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

    const now = Date.now();
    const pass = await ctx.db
      .query("premiumPasses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.gt(q.field("expiryDate"), now)
        )
      )
      .first();

    return pass;
  },
});

// Activate premium pass after payment
export const activatePremiumPass = mutation({
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

    // Check if transaction already used
    const existingPass = await ctx.db
      .query("premiumPasses")
      .withIndex("by_tx", (q) => q.eq("txHash", args.txHash))
      .first();

    if (existingPass) {
      throw new ConvexError({
        message: "Transaction already used",
        code: "CONFLICT",
      });
    }

    const now = Date.now();
    const expiryDate = now + 30 * 24 * 60 * 60 * 1000; // 30 days

    // Create premium pass
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

    // Check if user has active premium pass
    const now = Date.now();
    const pass = await ctx.db
      .query("premiumPasses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.gt(q.field("expiryDate"), now)
        )
      )
      .first();

    if (!pass) {
      return null;
    }

    const currentMonth = new Date().toISOString().slice(0, 7); // "2025-11"
    const premiumQuestData = await ctx.db
      .query("premiumQuests")
      .withIndex("by_month", (q) => q.eq("month", currentMonth))
      .first();

    if (!premiumQuestData) {
      return { quests: [], userProgress: [] };
    }

    // Get user progress for each quest
    const userProgress = await Promise.all(
      premiumQuestData.quests.map(async (quest) => {
        const progress = await ctx.db
          .query("userPremiumQuests")
          .withIndex("by_user_quest_month", (q) =>
            q.eq("userId", user._id).eq("questId", quest.id).eq("month", currentMonth)
          )
          .first();

        return {
          questId: quest.id,
          progress: progress?.progress || 0,
          completed: progress?.completed || false,
          claimed: progress?.claimed || false,
        };
      })
    );

    return {
      quests: premiumQuestData.quests,
      userProgress,
    };
  },
});

// Sync premium quest progress
export const syncPremiumQuestProgress = mutation({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user || !user.steamId) {
      return;
    }

    // Check if user has active premium pass
    const now = Date.now();
    const pass = await ctx.db
      .query("premiumPasses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.gt(q.field("expiryDate"), now)
        )
      )
      .first();

    if (!pass) {
      return;
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const premiumQuestData = await ctx.db
      .query("premiumQuests")
      .withIndex("by_month", (q) => q.eq("month", currentMonth))
      .first();

    if (!premiumQuestData) {
      return;
    }

    // Get user games for playtime tracking
    const games = await ctx.db
      .query("games")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const totalPlaytime = games.reduce((sum, game) => sum + game.playtime, 0);

    // Get check-ins for streak tracking
    const checkIns = await ctx.db
      .query("dailyCheckIns")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const quest of premiumQuestData.quests) {
      let progress = 0;

      if (quest.type === "playtime") {
        progress = Math.floor(totalPlaytime / 60); // Convert minutes to hours
      } else if (quest.type === "checkin") {
        progress = checkIns.length;
      }

      const existingProgress = await ctx.db
        .query("userPremiumQuests")
        .withIndex("by_user_quest_month", (q) =>
          q.eq("userId", user._id).eq("questId", quest.id).eq("month", currentMonth)
        )
        .first();

      const completed = progress >= quest.requirement;

      if (existingProgress) {
        await ctx.db.patch(existingProgress._id, {
          progress,
          completed,
        });
      } else {
        await ctx.db.insert("userPremiumQuests", {
          userId: user._id,
          questId: quest.id,
          month: currentMonth,
          progress,
          completed,
          claimed: false,
        });
      }
    }
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

    const currentMonth = new Date().toISOString().slice(0, 7);

    const progress = await ctx.db
      .query("userPremiumQuests")
      .withIndex("by_user_quest_month", (q) =>
        q.eq("userId", user._id).eq("questId", args.questId).eq("month", currentMonth)
      )
      .first();

    if (!progress) {
      throw new ConvexError({
        message: "Quest not found",
        code: "NOT_FOUND",
      });
    }

    if (!progress.completed) {
      throw new ConvexError({
        message: "Quest not completed",
        code: "BAD_REQUEST",
      });
    }

    if (progress.claimed) {
      throw new ConvexError({
        message: "Reward already claimed",
        code: "CONFLICT",
      });
    }

    // Get quest details
    const premiumQuestData = await ctx.db
      .query("premiumQuests")
      .withIndex("by_month", (q) => q.eq("month", currentMonth))
      .first();

    if (!premiumQuestData) {
      throw new ConvexError({
        message: "Premium quests not found",
        code: "NOT_FOUND",
      });
    }

    const quest = premiumQuestData.quests.find((q) => q.id === args.questId);
    if (!quest) {
      throw new ConvexError({
        message: "Quest not found",
        code: "NOT_FOUND",
      });
    }

    // Mark as claimed
    await ctx.db.patch(progress._id, {
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

    return { success: true, reward: { type: quest.rewardType, data: quest.rewardData } };
  },
});

// Get user's premium rewards
export const getUserPremiumRewards = query({
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
