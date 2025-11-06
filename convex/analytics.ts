import { query } from "./_generated/server";
import { v } from "convex/values";

export const getGameAnalytics = query({
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

    const games = await ctx.db
      .query("games")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Calculate total playtime
    const totalPlaytime = games.reduce((sum, game) => sum + game.playtime, 0);

    // Get top games by playtime
    const topGames = [...games]
      .sort((a, b) => b.playtime - a.playtime)
      .slice(0, 10)
      .map((game) => ({
        name: game.name,
        playtime: game.playtime,
        percentage: totalPlaytime > 0 ? (game.playtime / totalPlaytime) * 100 : 0,
      }));

    // Get recently played games
    const recentGames = [...games]
      .filter((game) => game.lastPlayed && game.lastPlayed > 0)
      .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0))
      .slice(0, 5)
      .map((game) => ({
        name: game.name,
        playtime: game.playtime,
        lastPlayed: game.lastPlayed || 0,
        imageUrl: game.imageUrl,
      }));

    // Get playtime distribution by ranges
    const playtimeRanges = {
      "0-10h": games.filter((g) => g.playtime < 600).length,
      "10-50h": games.filter((g) => g.playtime >= 600 && g.playtime < 3000).length,
      "50-100h": games.filter((g) => g.playtime >= 3000 && g.playtime < 6000).length,
      "100-500h": games.filter((g) => g.playtime >= 6000 && g.playtime < 30000).length,
      "500h+": games.filter((g) => g.playtime >= 30000).length,
    };

    return {
      totalGames: games.length,
      totalPlaytime,
      averagePlaytime: games.length > 0 ? totalPlaytime / games.length : 0,
      topGames,
      recentGames,
      playtimeRanges,
    };
  },
});

export const getProgressOverTime = query({
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

    // Get point history for the last 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const pointHistory = await ctx.db
      .query("pointHistory")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("timestamp"), thirtyDaysAgo))
      .collect();

    // Group by day
    const dailyPoints: Record<string, number> = {};
    pointHistory.forEach((entry) => {
      const date = new Date(entry.timestamp).toISOString().split("T")[0];
      dailyPoints[date] = (dailyPoints[date] || 0) + entry.amount;
    });

    // Convert to array and sort
    const chartData = Object.entries(dailyPoints)
      .map(([date, points]) => ({
        date,
        points,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return chartData;
  },
});

export const getAchievementStats = query({
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

    const profile = await ctx.db
      .query("steamProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) {
      return null;
    }

    const games = await ctx.db
      .query("games")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return {
      totalAchievements: profile.achievementCount,
      totalGames: games.length,
      averageAchievementsPerGame:
        games.length > 0 ? profile.achievementCount / games.length : 0,
    };
  },
});
