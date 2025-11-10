import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const saveMinedNFT = mutation({
  args: {
    appId: v.number(),
    gameName: v.string(),
    cardName: v.string(),
    achievementId: v.string(), // Unique achievement ID
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
        message: "User not logged in",
        code: "UNAUTHENTICATED",
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
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    // Check if this achievement has already been minted as NFT using unique achievement ID
    const existingNFT = await ctx.db
      .query("tradingCards")
      .withIndex("by_user_achievement", (q) => 
        q.eq("userId", user._id).eq("achievementId", args.achievementId)
      )
      .filter((q) => q.eq(q.field("mintedAsNft"), true))
      .first();

    if (existingNFT) {
      throw new ConvexError({
        message: "This achievement has already been minted as NFT",
        code: "CONFLICT",
      });
    }

    // Save the NFT card
    await ctx.db.insert("tradingCards", {
      userId: user._id,
      appId: args.appId,
      gameName: args.gameName,
      cardName: args.cardName,
      achievementId: args.achievementId,
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
