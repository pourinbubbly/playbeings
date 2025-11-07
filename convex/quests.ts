import { ConvexError } from "convex/values";
import { mutation, query, internalMutation, internalQuery, action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

const QUEST_TEMPLATES = [
  {
    type: "playtime",
    title: "Morning Warrior",
    description: "Play games for 30 minutes before noon",
    requirement: 30,
    reward: 75,
    icon: "🌅",
  },
  {
    type: "playtime",
    title: "Evening Grind",
    description: "Play games for 2 hours in the evening",
    requirement: 120,
    reward: 200,
    icon: "🌙",
  },
  {
    type: "game_count",
    title: "Genre Explorer",
    description: "Play games from 3 different genres today",
    requirement: 3,
    reward: 150,
    icon: "🧭",
  },
  {
    type: "achievement",
    title: "Achievement Sprint",
    description: "Unlock 3 achievements in a single session",
    requirement: 3,
    reward: 180,
    icon: "🏅",
  },
  {
    type: "playtime",
    title: "Weekend Marathon",
    description: "Play games for 5 hours total today",
    requirement: 300,
    reward: 400,
    icon: "🔥",
  },
  {
    type: "game_count",
    title: "Library Diversity",
    description: "Play 5 different games today",
    requirement: 5,
    reward: 250,
    icon: "📚",
  },
  {
    type: "achievement",
    title: "Trophy Collector",
    description: "Unlock 10 achievements today",
    requirement: 10,
    reward: 500,
    icon: "🏆",
  },
  {
    type: "playtime",
    title: "Speed Runner",
    description: "Complete a game session under 45 minutes",
    requirement: 45,
    reward: 100,
    icon: "⚡",
  },
  {
    type: "social",
    title: "Multiplayer Master",
    description: "Play 2 multiplayer games today",
    requirement: 2,
    reward: 150,
    icon: "👥",
  },
  {
    type: "consistency",
    title: "Daily Dedication",
    description: "Log in and play for 3 days in a row",
    requirement: 3,
    reward: 300,
    icon: "📅",
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

export const syncQuestProgress = mutation({
  args: {},
  handler: async (ctx) => {
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

    const dailyQuests = await ctx.db
      .query("dailyQuests")
      .withIndex("by_date", (q) => q.eq("date", today))
      .unique();

    if (!dailyQuests) {
      return { success: false, message: "No quests for today" };
    }

    // Get user progress for today's quests
    const userProgress = await ctx.db
      .query("userQuests")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .collect();

    // Calculate real-time progress based on Steam data
    const steamProfile = await ctx.db
      .query("steamProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!steamProfile) {
      return { success: false, message: "Steam profile not found" };
    }

    // Get user's games
    const userGames = await ctx.db
      .query("games")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Calculate today's playtime (simplified: using lastPlayed timestamp as proxy)
    const todayPlayedGames = userGames.filter(g => {
      const lastPlayedDate = g.lastPlayed ? new Date(g.lastPlayed * 1000).toISOString().split("T")[0] : null;
      return lastPlayedDate === today;
    });

    const todayPlaytimeMinutes = todayPlayedGames.reduce((sum, g) => sum + (g.playtime || 0), 0);

    // Get all achievement records from today for achievement counting
    const todayTimestamp = new Date(today).getTime();
    const tomorrowTimestamp = new Date(today);
    tomorrowTimestamp.setDate(tomorrowTimestamp.getDate() + 1);
    const tomorrowTime = tomorrowTimestamp.getTime();
    
    const todayAchievements = await ctx.db
      .query("tradingCards")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter(q => 
        q.and(
          q.gte(q.field("earnedAt"), todayTimestamp),
          q.lt(q.field("earnedAt"), tomorrowTime)
        )
      )
      .collect();

    // Calculate user's streak for consistency quests
    const checkIns = await ctx.db
      .query("dailyCheckIns")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(30);

    let currentStreak = 0;
    if (checkIns.length > 0) {
      const dates = checkIns.map(c => c.date).sort().reverse();
      const today = new Date().toISOString().split("T")[0];
      
      for (let i = 0; i < dates.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split("T")[0];
        
        if (dates[i] === expectedDateStr) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Update progress for each quest based on type
    for (const quest of dailyQuests.quests) {
      const existingProgress = userProgress.find(p => p.questId === quest.id);
      
      let calculatedProgress = 0;

      if (quest.type === "playtime") {
        // For playtime quests, use total playtime from all games played today
        calculatedProgress = todayPlaytimeMinutes;
      } else if (quest.type === "game_count") {
        // For game count quests, count unique games played today
        calculatedProgress = todayPlayedGames.length;
      } else if (quest.type === "achievement") {
        // For achievement quests, count today's achievements (trading cards)
        calculatedProgress = todayAchievements.length;
      } else if (quest.type === "consistency") {
        // For consistency quests, use current streak
        calculatedProgress = currentStreak;
      } else if (quest.type === "social") {
        // For social quests, use existing progress
        calculatedProgress = existingProgress?.progress || 0;
      }

      // Update or create progress entry
      if (existingProgress) {
        // Only update if calculated progress is higher
        if (calculatedProgress > existingProgress.progress && !existingProgress.claimed) {
          await ctx.db.patch(existingProgress._id, {
            progress: calculatedProgress,
            completed: calculatedProgress >= quest.requirement,
          });
        }
      } else if (calculatedProgress > 0) {
        // Create new progress entry
        await ctx.db.insert("userQuests", {
          userId: user._id,
          questId: quest.id,
          date: today,
          progress: calculatedProgress,
          completed: calculatedProgress >= quest.requirement,
          claimed: false,
        });
      }
    }

    return { success: true };
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
    questTitle: v.string(),
    reward: v.number(),
    requirement: v.number(),
    txSignature: v.string(),
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
        message: "Quest progress not found. Please refresh the page and try again.",
      });
    }

    if (userQuest.claimed) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Quest reward already claimed.",
      });
    }

    if (userQuest.progress < args.requirement) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Quest not completed yet. Progress: " + userQuest.progress + " / " + args.requirement,
      });
    }

    // Mark as completed and claimed
    await ctx.db.patch(userQuest._id, {
      completed: true,
      claimed: true,
    });

    // Get all active boosts
    const boosts = await ctx.db
      .query("nftBoosts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Calculate total boost percentage
    const totalBoostPercentage = boosts.reduce(
      (sum, boost) => sum + boost.boostPercentage,
      0
    );

    // Apply boost: reward * (1 + totalBoost/100)
    const boostedReward = Math.floor(
      args.reward * (1 + totalBoostPercentage / 100)
    );

    // Award points
    await ctx.db.patch(user._id, {
      totalPoints: user.totalPoints + boostedReward,
      level: Math.floor((user.totalPoints + boostedReward) / 500) + 1,
    });

    // Record point history with transaction hash
    await ctx.db.insert("pointHistory", {
      userId: user._id,
      amount: boostedReward,
      reason: `Completed quest: ${args.questTitle}${totalBoostPercentage > 0 ? ` (+${totalBoostPercentage}% boost)` : ""} | Tx: ${args.txSignature}`,
      timestamp: Date.now(),
    });

    return {
      success: true,
      newTotal: user.totalPoints + boostedReward,
      boostedPoints: boostedReward,
      basePoints: args.reward,
      boostPercentage: totalBoostPercentage,
    };
  },
});

export const syncAchievements = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const user = await ctx.runQuery(internal.quests.getUserBySub, {
      sub: identity.tokenIdentifier,
    });

    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const steamProfile = await ctx.runQuery(internal.quests.getSteamProfile, {
      userId: user._id,
    });

    if (!steamProfile) {
      return { success: false, message: "Steam profile not found" };
    }

    // Fetch achievements from Steam API
    const steamAchievements = await ctx.runAction(api.steam.getSteamAchievements, {
      steamId: steamProfile.steamId,
    });

    // Get existing achievements
    const existingCards = await ctx.runQuery(internal.quests.getUserCards, {
      userId: user._id,
    });

    const existingAchievementIds = new Set(
      existingCards.map((a: { appId: number; cardName: string }) => `${a.appId}_${a.cardName}`)
    );

    // Add new achievements to tradingCards
    let addedCount = 0;
    for (const achievement of steamAchievements) {
      const achievementId = `${achievement.gameId}_${achievement.name}`;
      if (!existingAchievementIds.has(achievementId)) {
        await ctx.runMutation(internal.quests.addAchievementCard, {
          userId: user._id,
          appId: achievement.gameId,
          gameName: achievement.gameName,
          cardName: achievement.name,
          imageUrl: achievement.imageUrl,
          rarity: achievement.rarity,
        });
        addedCount++;
      }
    }

    return { success: true, addedCount };
  },
});

export const getUserBySub = internalQuery({
  args: { sub: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.sub))
      .unique();
  },
});

export const getSteamProfile = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("steamProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const getUserCards = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tradingCards")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const addAchievementCard = internalMutation({
  args: {
    userId: v.id("users"),
    appId: v.number(),
    gameName: v.string(),
    cardName: v.string(),
    imageUrl: v.string(),
    rarity: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("tradingCards", {
      userId: args.userId,
      appId: args.appId,
      gameName: args.gameName,
      cardName: args.cardName,
      imageUrl: args.imageUrl,
      rarity: args.rarity,
      mintedAsNft: false,
      earnedAt: Date.now(),
    });
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
