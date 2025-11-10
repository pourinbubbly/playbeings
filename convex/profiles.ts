import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveSteamProfile = mutation({
  args: {
    steamId: v.string(),
    personaName: v.string(),
    avatarUrl: v.string(),
    profileUrl: v.string(),
    totalPlaytime: v.number(),
    gameCount: v.number(),
    achievementCount: v.number(),
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

    // Check if this Steam ID is already linked to another user
    const steamIdInUse = await ctx.db
      .query("steamProfiles")
      .withIndex("by_steam_id", (q) => q.eq("steamId", args.steamId))
      .first();

    if (steamIdInUse && steamIdInUse.userId !== user._id) {
      throw new ConvexError({
        code: "CONFLICT",
        message: "This Steam account is already linked to another PlayBeings account",
      });
    }

    // Update user with steamId
    await ctx.db.patch(user._id, {
      steamId: args.steamId,
    });

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("steamProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        steamId: args.steamId,
        personaName: args.personaName,
        avatarUrl: args.avatarUrl,
        profileUrl: args.profileUrl,
        totalPlaytime: args.totalPlaytime,
        gameCount: args.gameCount,
        achievementCount: args.achievementCount,
        lastSynced: Date.now(),
      });
      return existingProfile._id;
    } else {
      // Create new profile
      return await ctx.db.insert("steamProfiles", {
        userId: user._id,
        steamId: args.steamId,
        personaName: args.personaName,
        avatarUrl: args.avatarUrl,
        profileUrl: args.profileUrl,
        totalPlaytime: args.totalPlaytime,
        gameCount: args.gameCount,
        achievementCount: args.achievementCount,
        lastSynced: Date.now(),
      });
    }
  },
});

export const saveGames = mutation({
  args: {
    games: v.array(
      v.object({
        appId: v.number(),
        name: v.string(),
        playtime: v.number(),
        imageUrl: v.string(),
        lastPlayed: v.number(),
      })
    ),
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

    // Delete existing games
    const existingGames = await ctx.db
      .query("games")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const game of existingGames) {
      await ctx.db.delete(game._id);
    }

    // Insert new games
    for (const game of args.games) {
      await ctx.db.insert("games", {
        userId: user._id,
        appId: game.appId,
        name: game.name,
        playtime: game.playtime,
        imageUrl: game.imageUrl,
        lastPlayed: game.lastPlayed || undefined,
      });
    }

    return { success: true };
  },
});

export const getSteamProfile = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let userId = args.userId;

    // If no userId provided, get current user
    if (!userId) {
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
      userId = user._id;
    }

    const profile = await ctx.db
      .query("steamProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return profile;
  },
});

export const getUserGames = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    let userId = args.userId;

    // If no userId provided, get current user
    if (!userId) {
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
      userId = user._id;
    }

    const games = await ctx.db
      .query("games")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return games;
  },
});
