import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const saveMinedNFT = mutation({
  args: {
    appId: v.number(),
    gameName: v.string(),
    cardName: v.string(),
    imageUrl: v.string(),
    rarity: v.string(),
    nftAddress: v.string(),
    nftTokenId: v.string(),
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

    // Save the NFT card
    await ctx.db.insert("tradingCards", {
      userId: user._id,
      appId: args.appId,
      gameName: args.gameName,
      cardName: args.cardName,
      imageUrl: args.imageUrl,
      rarity: args.rarity,
      mintedAsNft: true,
      nftAddress: args.nftAddress,
      nftTokenId: args.nftTokenId,
      earnedAt: Date.now(),
    });

    // Activate the boost
    const existingBoost = await ctx.db
      .query("nftBoosts")
      .withIndex("by_nft", (q) => q.eq("nftAddress", args.nftAddress))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    if (existingBoost) {
      await ctx.db.patch(existingBoost._id, {
        boostPercentage: args.boostPercentage,
        isActive: true,
      });
    } else {
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
