import { ConvexError } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

const QUEST_TEMPLATES = [
  {
    type: "playtime",
    title: "Morning Warrior",
    description: "Play games for 30 minutes before noon",
    requirement: 30,
    reward: 75,
    icon: "sunrise",
  },
  {
    type: "playtime",
    title: "Evening Grind",
    description: "Play games for 2 hours in the evening",
    requirement: 120,
    reward: 200,
    icon: "moon",
  },
  {
    type: "game_count",
    title: "Genre Explorer",
    description: "Play games from 3 different genres today",
    requirement: 3,
    reward: 150,
    icon: "compass",
  },
  {
    type: "achievement",
    title: "Achievement Sprint",
    description: "Unlock 3 achievements in a single session",
    requirement: 3,
    reward: 180,
    icon: "medal",
  },
  {
    type: "playtime",
    title: "Weekend Marathon",
    description: "Play games for 5 hours total today",
    requirement: 300,
    reward: 400,
    icon: "flame",
  },
  {
    type: "game_count",
    title: "Library Diversity",
    description: "Play 5 different games today",
    requirement: 5,
    reward: 250,
    icon: "library",
  },
  {
    type: "achievement",
    title: "Trophy Collector",
    description: "Unlock 10 achievements today",
    requirement: 10,
    reward: 500,
    icon: "trophy",
  },
  {
    type: "playtime",
    title: "Speed Runner",
    description: "Complete a game session under 45 minutes",
    requirement: 45,
    reward: 100,
    icon: "zap",
  },
  {
    type: "social",
    title: "Multiplayer Master",
    description: "Play 2 multiplayer games today",
    requirement: 2,
    reward: 150,
    icon: "users",
  },
  {
    type: "consistency",
    title: "Daily Dedication",
    description: "Log in and play for 3 days in a row",
    requirement: 3,
    reward: 300,
    icon: "calendar",
  },
];

export const generateDailyQuests = internalMutation({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    // Check if quests already exist for this date
    const existing = await ctx.db
      .query("dailyQuests")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .unique();

    if (existing) {
      return existing._id;
    }

    // Generate 5 random quests (increased from 3)
    const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
    const selectedQuests = shuffled.slice(0, 5).map((quest, index) => ({
      id: `quest_${args.date}_${index}`,
      ...quest,
    }));

    return await ctx.db.insert("dailyQuests", {
      date: args.date,
      quests: selectedQuests,
    });
  },
});

export const getTodayQuests = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];

    const dailyQuests = await ctx.db
      .query("dailyQuests")
      .withIndex("by_date", (q) => q.eq("date", today))
      .unique();

    if (!dailyQuests) {
      return null;
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { quests: dailyQuests.quests, userProgress: [] };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return { quests: dailyQuests.quests, userProgress: [] };
    }

    // Get user progress for today's quests
    const userProgress = await ctx.db
      .query("userQuests")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .collect();

    return {
      quests: dailyQuests.quests,
      userProgress,
    };
  },
});

export const updateQuestProgress = mutation({
  args: {
    questId: v.string(),
    progress: v.number(),
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

    const today = new Date().toISOString().split("T")[0];

    // Find existing progress
    const existingProgress = await ctx.db
      .query("userQuests")
      .withIndex("by_user_quest_date", (q) =>
        q.eq("userId", user._id).eq("questId", args.questId).eq("date", today)
      )
      .unique();

    if (existingProgress) {
      // Update progress
      await ctx.db.patch(existingProgress._id, {
        progress: args.progress,
      });
    } else {
      // Create new progress entry
      await ctx.db.insert("userQuests", {
        userId: user._id,
        questId: args.questId,
        date: today,
        progress: args.progress,
        completed: false,
        claimed: false,
      });
    }

    return { success: true };
  },
});

export const completeQuest = mutation({
  args: {
    questId: v.string(),
    reward: v.number(),
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

    const today = new Date().toISOString().split("T")[0];

    const userQuest = await ctx.db
      .query("userQuests")
      .withIndex("by_user_quest_date", (q) =>
        q.eq("userId", user._id).eq("questId", args.questId).eq("date", today)
      )
      .unique();

    if (!userQuest) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Quest progress not found",
      });
    }

    if (userQuest.claimed) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Quest already claimed",
      });
    }

    // Mark as completed and claimed
    await ctx.db.patch(userQuest._id, {
      completed: true,
      claimed: true,
    });

    // Award points
    await ctx.db.patch(user._id, {
      totalPoints: user.totalPoints + args.reward,
      level: Math.floor((user.totalPoints + args.reward) / 500) + 1,
    });

    // Record point history
    await ctx.db.insert("pointHistory", {
      userId: user._id,
      amount: args.reward,
      reason: `Completed quest: ${args.questId}`,
      timestamp: Date.now(),
    });

    return {
      success: true,
      newTotal: user.totalPoints + args.reward,
    };
  },
});

export const getUserQuestStats = query({
  args: {},
  handler: async (ctx) => {
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

    const today = new Date().toISOString().split("T")[0];

    const todayQuests = await ctx.db
      .query("userQuests")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .collect();

    const allQuests = await ctx.db
      .query("userQuests")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .collect();

    return {
      todayCompleted: todayQuests.filter((q) => q.completed).length,
      todayTotal: todayQuests.length,
      totalCompleted: allQuests.filter((q) => q.completed).length,
    };
  },
});
