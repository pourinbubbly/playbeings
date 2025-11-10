import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMintedNFTs = query({
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

    const nfts = await ctx.db
      .query("tradingCards")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("mintedAsNft"), true))
      .order("desc")
      .collect();

    return nfts;
  },
});

export const getActiveBoosts = query({
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

    const now = Date.now();
    
    const boosts = await ctx.db
      .query("nftBoosts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter out expired boosts (only return non-expired ones)
    const activeBoosts = boosts.filter(
      (boost) => boost.expiresAt !== undefined && boost.expiresAt > now
    );

    return activeBoosts;
  },
});

export const calculatePointsWithBoost = query({
  args: { basePoints: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return args.basePoints;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      return args.basePoints;
    }

    const now = Date.now();

    // Get all active boosts that haven't expired
    const boosts = await ctx.db
      .query("nftBoosts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter only non-expired boosts
    const activeBoosts = boosts.filter(
      (boost) => boost.expiresAt !== undefined && boost.expiresAt > now
    );

    // Calculate total boost percentage
    const totalBoostPercentage = activeBoosts.reduce(
      (sum, boost) => sum + boost.boostPercentage,
      0
    );

    // Apply boost: basePoints * (1 + totalBoost/100)
    const boostedPoints = Math.floor(
      args.basePoints * (1 + totalBoostPercentage / 100)
    );

    return boostedPoints;
  },
});

export const activateNFTBoost = mutation({
  args: {
    nftAddress: v.string(),
    boostPercentage: v.number(),
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

    const now = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000; // 30 days
    const expiresAt = now + thirtyDaysInMs;

    // Check if boost already exists
    const existingBoost = await ctx.db
      .query("nftBoosts")
      .withIndex("by_nft", (q) => q.eq("nftAddress", args.nftAddress))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    if (existingBoost) {
      // Update existing boost with new expiry
      await ctx.db.patch(existingBoost._id, {
        boostPercentage: args.boostPercentage,
        isActive: true,
        activatedAt: now,
        expiresAt: expiresAt,
      });
    } else {
      // Create new boost
      await ctx.db.insert("nftBoosts", {
        userId: user._id,
        nftAddress: args.nftAddress,
        boostPercentage: args.boostPercentage,
        isActive: true,
        activatedAt: now,
        expiresAt: expiresAt,
      });
    }

    return { success: true };
  },
});
