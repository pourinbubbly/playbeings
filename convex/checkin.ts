import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const performCheckIn = mutation({
  args: {
    txHash: v.string(),
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
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Get today's date string (YYYY-MM-DD)
    const now = Date.now();
    const today = new Date(now).toISOString().split("T")[0];

    // Check if already checked in today
    const existingCheckIn = await ctx.db
      .query("dailyCheckIns")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", user._id).eq("date", today),
      )
      .unique();

    if (existingCheckIn) {
      throw new ConvexError({
        code: "CONFLICT",
        message: "Already checked in today",
      });
    }

    // Calculate streak
    let newStreak = 1;
    const lastCheckIn = user.lastCheckIn;

    if (lastCheckIn) {
      const lastCheckInDate = new Date(lastCheckIn).toISOString().split("T")[0];
      const yesterday = new Date(now - 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      // If last check-in was yesterday, increment streak
      if (lastCheckInDate === yesterday) {
        newStreak = user.currentStreak + 1;
      }
      // If it was today (shouldn't happen due to check above), keep current
      else if (lastCheckInDate === today) {
        newStreak = user.currentStreak;
      }
      // Otherwise, streak is broken, reset to 1
    }

    // Calculate points based on streak
    const basePoints = 10;
    const streakBonus = Math.min(Math.floor(newStreak / 7) * 5, 50); // +5 points per week, max +50
    const totalPoints = basePoints + streakBonus;

    // Create check-in record
    await ctx.db.insert("dailyCheckIns", {
      userId: user._id,
      date: today,
      points: totalPoints,
      streakDay: newStreak,
      txHash: args.txHash,
      txStatus: "pending",
      createdAt: now,
    });

    // Update user
    const newTotalPoints = user.totalPoints + totalPoints;
    const newLongestStreak = Math.max(user.longestStreak, newStreak);

    await ctx.db.patch(user._id, {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastCheckIn: now,
      totalPoints: newTotalPoints,
    });

    // Record point history
    await ctx.db.insert("pointHistory", {
      userId: user._id,
      amount: totalPoints,
      reason: `Daily check-in (Day ${newStreak})`,
      timestamp: now,
    });

    return {
      success: true,
      points: totalPoints,
      streak: newStreak,
      longestStreak: newLongestStreak,
    };
  },
});

export const getCheckInStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        canCheckIn: false,
        hasCheckedInToday: false,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: null,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      return {
        canCheckIn: false,
        hasCheckedInToday: false,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckIn: null,
      };
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if already checked in today
    const todayCheckIn = await ctx.db
      .query("dailyCheckIns")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", user._id).eq("date", today),
      )
      .unique();

    return {
      canCheckIn: !todayCheckIn,
      hasCheckedInToday: !!todayCheckIn,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastCheckIn: user.lastCheckIn,
      nextCheckInPoints: calculateNextCheckInPoints(user.currentStreak, !!todayCheckIn),
    };
  },
});

export const getCheckInHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      return [];
    }

    const checkIns = await ctx.db
      .query("dailyCheckIns")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(30);

    return checkIns;
  },
});

export const updateCheckInTxStatus = mutation({
  args: {
    date: v.string(),
    status: v.string(),
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
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const checkIn = await ctx.db
      .query("dailyCheckIns")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", user._id).eq("date", args.date),
      )
      .unique();

    if (!checkIn) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Check-in not found",
      });
    }

    await ctx.db.patch(checkIn._id, {
      txStatus: args.status,
    });

    return { success: true };
  },
});

function calculateNextCheckInPoints(currentStreak: number, hasCheckedInToday: boolean): number {
  const nextStreak = hasCheckedInToday ? currentStreak : currentStreak + 1;
  const basePoints = 10;
  const streakBonus = Math.min(Math.floor(nextStreak / 7) * 5, 50);
  return basePoints + streakBonus;
}
