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

    const currentMonth = new Date().toISOString().slice(0, 7);

    // Get quest details first
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
    if (!quest || !quest.dayNumber) {
      throw new ConvexError({
        message: "Quest not found",
        code: "NOT_FOUND",
      });
    }

    // Check if user can claim this day (can only claim current or future days within the month)
    const passInfo = await ctx.db
      .query("premiumPasses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.gt(q.field("expiryDate"), Date.now())
        )
      )
      .first();

    if (!passInfo) {
      throw new ConvexError({
        message: "No active Premium Pass",
        code: "FORBIDDEN",
      });
    }

    // Calculate which day of the pass the user is on
    const passStartDate = new Date(passInfo.purchaseDate);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - passStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // User can only claim the current day or earlier days (but not future days, and not missed days)
    if (quest.dayNumber > daysSinceStart) {
      throw new ConvexError({
        message: `This quest unlocks on Day ${quest.dayNumber}. You are currently on Day ${daysSinceStart}.`,
        code: "BAD_REQUEST",
      });
    }

    // Check if user has already claimed any quest today
    const todayString = new Date().toISOString().slice(0, 10);
    const todaysClaims = await ctx.db
      .query("userPremiumQuests")
      .withIndex("by_user_and_month", (q) => q.eq("userId", user._id).eq("month", currentMonth))
      .filter((q) => q.eq(q.field("claimed"), true))
      .collect();

    const alreadyClaimedToday = todaysClaims.some((claim) => {
      if (!claim.claimedAt) return false;
      const claimDate = new Date(claim.claimedAt).toISOString().slice(0, 10);
      return claimDate === todayString;
    });

    if (alreadyClaimedToday) {
      throw new ConvexError({
        message: "You have already claimed a quest today. Come back tomorrow!",
        code: "CONFLICT",
      });
    }

    const progress = await ctx.db
      .query("userPremiumQuests")
      .withIndex("by_user_quest_month", (q) =>
        q.eq("userId", user._id).eq("questId", args.questId).eq("month", currentMonth)
      )
      .first();

    if (progress?.claimed) {
      throw new ConvexError({
        message: "Reward already claimed",
        code: "CONFLICT",
      });
    }

    // Mark as claimed
    if (progress) {
      await ctx.db.patch(progress._id, {
        claimed: true,
        completed: true,
        txHash: args.txHash,
        rewardType: quest.rewardType,
        rewardData: quest.rewardData,
        claimedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userPremiumQuests", {
        userId: user._id,
        questId: args.questId,
        month: currentMonth,
        progress: 1,
        completed: true,
        claimed: true,
        txHash: args.txHash,
        rewardType: quest.rewardType,
        rewardData: quest.rewardData,
        claimedAt: Date.now(),
      });
    }

    // Add reward to user's collection (if emoji/sticker)
    if (quest.rewardType === "emoji" || quest.rewardType === "sticker") {
      await ctx.db.insert("premiumRewards", {
        userId: user._id,
        rewardType: quest.rewardType,
        rewardData: quest.rewardData,
        earnedAt: Date.now(),
      });
    }

    // Add points if this is a milestone day
    if (quest.rewardType === "points" && quest.pointsReward) {
      await ctx.db.patch(user._id, {
        totalPoints: user.totalPoints + quest.pointsReward,
      });

      await ctx.db.insert("pointHistory", {
        userId: user._id,
        amount: quest.pointsReward,
        reason: `Premium Quest: ${quest.title}`,
        timestamp: Date.now(),
      });
    }

    return { 
      success: true, 
      reward: { 
        type: quest.rewardType, 
        data: quest.rewardData,
        points: quest.pointsReward || 0,
      } 
    };
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
