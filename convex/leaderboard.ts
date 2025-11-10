import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    const topUsers = await ctx.db
      .query("users")
      .withIndex("by_points")
      .order("desc")
      .take(limit);

    // Get steam profiles for each user
    const leaderboard = await Promise.all(
      topUsers.map(async (user, index) => {
        const steamProfile = await ctx.db
          .query("steamProfiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .unique();

        // Check if user has active premium pass
        const now = Date.now();
        const premiumPass = await ctx.db
          .query("premiumPasses")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) =>
            q.and(
              q.eq(q.field("isActive"), true),
              q.gt(q.field("expiryDate"), now)
            )
          )
          .first();

        return {
          rank: index + 1,
          userId: user._id,
          name: steamProfile?.personaName || user.name || "Anonymous",
          avatar: steamProfile?.avatarUrl || "",
          points: user.totalPoints,
          level: user.level,
          hasPremiumPass: !!premiumPass,
        };
      })
    );

    return leaderboard;
  },
});

export const getCurrentUserRank = query({
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

    // Get all users with more points
    const usersAbove = await ctx.db
      .query("users")
      .withIndex("by_points")
      .order("desc")
      .filter((q) => q.gt(q.field("totalPoints"), user.totalPoints))
      .collect();

    const rank = usersAbove.length + 1;

    // Get steam profile
    const steamProfile = await ctx.db
      .query("steamProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    // Check if user has active premium pass
    const now = Date.now();
    const premiumPass = await ctx.db
      .query("premiumPasses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.gt(q.field("expiryDate"), now)
        )
      )
      .first();

    return {
      rank,
      userId: user._id,
      name: steamProfile?.personaName || user.name || "Anonymous",
      avatar: steamProfile?.avatarUrl || "",
      points: user.totalPoints,
      level: user.level,
      hasPremiumPass: !!premiumPass,
    };
  },
});

export const getPointHistory = query({
  args: { limit: v.optional(v.number()) },
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

    const limit = args.limit || 50;

    const history = await ctx.db
      .query("pointHistory")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    return history;
  },
});
