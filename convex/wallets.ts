import { ConvexError } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const connectWallet = mutation({
  args: {
    walletAddress: v.string(),
    walletType: v.string(),
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

    // Check if wallet already connected
    const existingWallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (existingWallet) {
      // Update existing wallet
      await ctx.db.patch(existingWallet._id, {
        walletAddress: args.walletAddress,
        walletType: args.walletType,
      });
      return existingWallet._id;
    } else {
      // Create new wallet entry
      return await ctx.db.insert("wallets", {
        userId: user._id,
        walletAddress: args.walletAddress,
        walletType: args.walletType,
      });
    }
  },
});

export const disconnectWallet = mutation({
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

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (wallet) {
      await ctx.db.delete(wallet._id);
    }

    return { success: true };
  },
});

export const getConnectedWallet = query({
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

    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    return wallet;
  },
});

export const getWalletByAddress = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_address", (q) => q.eq("walletAddress", args.walletAddress))
      .unique();

    return wallet;
  },
});

// Internal query to get user's wallet
export const getUserWallet = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    return wallet;
  },
});
