import { ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const CARD_RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

export const earnTradingCard = mutation({
  args: {
    appId: v.number(),
    gameName: v.string(),
    imageUrl: v.string(),
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

    // Random rarity assignment
    const rarityRoll = Math.random();
    let rarity: string;
    if (rarityRoll < 0.5) rarity = "Common";
    else if (rarityRoll < 0.75) rarity = "Uncommon";
    else if (rarityRoll < 0.9) rarity = "Rare";
    else if (rarityRoll < 0.97) rarity = "Epic";
    else rarity = "Legendary";

    // Generate card name
    const cardNames = [
      "Hero",
      "Warrior",
      "Champion",
      "Legend",
      "Master",
      "Elite",
      "Guardian",
      "Defender",
    ];
    const randomName =
      cardNames[Math.floor(Math.random() * cardNames.length)];

    const cardId = await ctx.db.insert("tradingCards", {
      userId: user._id,
      appId: args.appId,
      gameName: args.gameName,
      cardName: `${randomName} Card`,
      imageUrl: args.imageUrl,
      rarity,
      mintedAsNft: false,
      earnedAt: Date.now(),
    });

    // Award points based on rarity
    const pointsByRarity: Record<string, number> = {
      Common: 10,
      Uncommon: 25,
      Rare: 50,
      Epic: 100,
      Legendary: 250,
    };

    const points = pointsByRarity[rarity] || 10;
    await ctx.db.patch(user._id, {
      totalPoints: user.totalPoints + points,
      level: Math.floor((user.totalPoints + points) / 500) + 1,
    });

    await ctx.db.insert("pointHistory", {
      userId: user._id,
      amount: points,
      reason: `Earned ${rarity} trading card from ${args.gameName}`,
      timestamp: Date.now(),
    });

    return {
      cardId,
      rarity,
      points,
    };
  },
});

export const getUserCards = query({
  args: {},
  handler: async (ctx) => {
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

    const cards = await ctx.db
      .query("tradingCards")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return cards;
  },
});

export const getCardById = query({
  args: { cardId: v.id("tradingCards") },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.cardId);
    return card;
  },
});

export const markCardAsMinted = mutation({
  args: {
    cardId: v.id("tradingCards"),
    nftAddress: v.string(),
    nftTokenId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const card = await ctx.db.get(args.cardId);
    if (!card) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Card not found",
      });
    }

    await ctx.db.patch(args.cardId, {
      mintedAsNft: true,
      nftAddress: args.nftAddress,
      nftTokenId: args.nftTokenId,
    });

    // Award bonus points for minting
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (user) {
      const bonusPoints = 50;
      await ctx.db.patch(user._id, {
        totalPoints: user.totalPoints + bonusPoints,
        level: Math.floor((user.totalPoints + bonusPoints) / 500) + 1,
      });

      await ctx.db.insert("pointHistory", {
        userId: user._id,
        amount: bonusPoints,
        reason: `Minted NFT: ${card.cardName}`,
        timestamp: Date.now(),
      });
    }

    return { success: true };
  },
});

export const getCardStats = query({
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

    const allCards = await ctx.db
      .query("tradingCards")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const mintedCards = allCards.filter((card) => card.mintedAsNft);

    const rarityCount = CARD_RARITIES.reduce(
      (acc, rarity) => {
        acc[rarity] = allCards.filter((card) => card.rarity === rarity).length;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalCards: allCards.length,
      mintedCards: mintedCards.length,
      unmintedCards: allCards.length - mintedCards.length,
      rarityCount,
    };
  },
});
