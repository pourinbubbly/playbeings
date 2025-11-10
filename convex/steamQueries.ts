import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Internal query to get user's games
export const getUserGames = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const games = await ctx.db
      .query("games")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    return games.sort((a, b) => b.playtime - a.playtime);
  },
});
