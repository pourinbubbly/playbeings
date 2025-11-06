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

    const boosts = await ctx.db
      .query("nftBoosts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return boosts;
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

    // Check if boost already exists
    const existingBoost = await ctx.db
      .query("nftBoosts")
      .withIndex("by_nft", (q) => q.eq("nftAddress", args.nftAddress))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    if (existingBoost) {
      // Update existing boost
      await ctx.db.patch(existingBoost._id, {
        boostPercentage: args.boostPercentage,
        isActive: true,
      });
    } else {
      // Create new boost
      await ctx.db.insert("nftBoosts", {
        userId: user._id,
        nftAddress: args.nftAddress,
        boostPercentage: args.boostPercentage,
        isActive: true,
      });
    }

    return { success: true };
  },
});
