import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (user !== null) {
      return user._id;
    }
    // If it's a new identity, create a new User.
    const userId = await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      tokenIdentifier: identity.tokenIdentifier,
      totalPoints: 0,
      level: 1,
      followerCount: 0,
      followingCount: 0,
      currentStreak: 0,
      longestStreak: 0,
    });
    
    return userId;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const getStorageUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "Called getCurrentUser without authentication present",
      });
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    return user;
  },
});

export const updateProfile = mutation({
  args: {
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatar: v.optional(v.string()),
    banner: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      twitter: v.optional(v.string()),
      discord: v.optional(v.string()),
      twitch: v.optional(v.string()),
      youtube: v.optional(v.string()),
    })),
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

    // Check if username is taken
    if (args.username && args.username !== user.username) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .unique();
      
      if (existingUser) {
        throw new ConvexError({
          code: "CONFLICT",
          message: "Username already taken",
        });
      }
    }

    await ctx.db.patch(user._id, {
      username: args.username,
      bio: args.bio,
      avatar: args.avatar,
      banner: args.banner,
      socialLinks: args.socialLinks,
    });

    return { success: true };
  },
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    
    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  },
});

export const deleteAccount = mutation({
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
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Delete all related data
    // Steam profiles
    const steamProfiles = await ctx.db
      .query("steamProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const profile of steamProfiles) {
      await ctx.db.delete(profile._id);
    }

    // Games
    const games = await ctx.db
      .query("games")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const game of games) {
      await ctx.db.delete(game._id);
    }

    // User quests
    const userQuests = await ctx.db
      .query("userQuests")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .collect();
    for (const quest of userQuests) {
      await ctx.db.delete(quest._id);
    }

    // Trading cards
    const cards = await ctx.db
      .query("tradingCards")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const card of cards) {
      await ctx.db.delete(card._id);
    }

    // NFT boosts
    const boosts = await ctx.db
      .query("nftBoosts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const boost of boosts) {
      await ctx.db.delete(boost._id);
    }

    // Reward redemptions
    const redemptions = await ctx.db
      .query("rewardRedemptions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const redemption of redemptions) {
      await ctx.db.delete(redemption._id);
    }

    // Point history
    const pointHistory = await ctx.db
      .query("pointHistory")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const point of pointHistory) {
      await ctx.db.delete(point._id);
    }

    // Wallets
    const wallets = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const wallet of wallets) {
      await ctx.db.delete(wallet._id);
    }

    // Follows (as follower)
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();
    for (const follow of follows) {
      await ctx.db.delete(follow._id);
    }

    // Follows (as following)
    const followers = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", user._id))
      .collect();
    for (const follower of followers) {
      await ctx.db.delete(follower._id);
    }

    // Profile comments
    const comments = await ctx.db
      .query("profileComments")
      .withIndex("by_author", (q) => q.eq("authorId", user._id))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Daily check-ins
    const checkIns = await ctx.db
      .query("dailyCheckIns")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const checkIn of checkIns) {
      await ctx.db.delete(checkIn._id);
    }

    // Finally, delete the user
    await ctx.db.delete(user._id);

    return { success: true };
  },
});
