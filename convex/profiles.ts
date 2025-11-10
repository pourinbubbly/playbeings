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

    // Get existing games to track playtime changes
    const existingGames = await ctx.db
      .query("games")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    // Create a map of existing games for quick lookup
    const existingGamesMap = new Map(existingGames.map(g => [g.appId, g]));
    
    // Today's date for tracking daily playtime
    const today = new Date().toISOString().split("T")[0];

    // Update or insert games, tracking playtime changes
    for (const newGame of args.games) {
      const existingGame = existingGamesMap.get(newGame.appId);
      
      if (existingGame) {
        // Calculate playtime increase
        const playtimeIncrease = newGame.playtime - existingGame.playtime;
        
        // If there's an increase, record it for today
        if (playtimeIncrease > 0) {
          // Check if we already have a record for today
          const existingDailyRecord = await ctx.db
            .query("dailyPlaytime")
            .withIndex("by_user_appid_date", (q) => 
              q.eq("userId", user._id).eq("appId", newGame.appId).eq("date", today)
            )
            .unique();
          
          if (existingDailyRecord) {
            // Update existing record
            await ctx.db.patch(existingDailyRecord._id, {
              playtimeMinutes: existingDailyRecord.playtimeMinutes + playtimeIncrease,
            });
          } else {
            // Create new record
            await ctx.db.insert("dailyPlaytime", {
              userId: user._id,
              appId: newGame.appId,
              gameName: newGame.name,
              date: today,
              playtimeMinutes: playtimeIncrease,
            });
          }
        }
        
        // Update the game
        await ctx.db.patch(existingGame._id, {
          name: newGame.name,
          playtime: newGame.playtime,
          imageUrl: newGame.imageUrl,
          lastPlayed: newGame.lastPlayed || undefined,
        });
      } else {
        // New game - insert it
        await ctx.db.insert("games", {
          userId: user._id,
          appId: newGame.appId,
          name: newGame.name,
          playtime: newGame.playtime,
          imageUrl: newGame.imageUrl,
          lastPlayed: newGame.lastPlayed || undefined,
        });
        
        // For new games, we don't record daily playtime since we don't know 
        // if the playtime was from today or accumulated over time
      }
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
