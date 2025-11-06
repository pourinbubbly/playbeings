import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    steamId: v.optional(v.string()),
    totalPoints: v.number(),
    level: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_steam_id", ["steamId"])
    .index("by_points", ["totalPoints"]),

  steamProfiles: defineTable({
    userId: v.id("users"),
    steamId: v.string(),
    personaName: v.string(),
    avatarUrl: v.string(),
    profileUrl: v.string(),
    totalPlaytime: v.number(),
    gameCount: v.number(),
    achievementCount: v.number(),
    lastSynced: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_steam_id", ["steamId"]),

  games: defineTable({
    userId: v.id("users"),
    appId: v.number(),
    name: v.string(),
    playtime: v.number(),
    imageUrl: v.string(),
    lastPlayed: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_appid", ["userId", "appId"]),

  dailyQuests: defineTable({
    date: v.string(),
    quests: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        title: v.string(),
        description: v.string(),
        requirement: v.number(),
        reward: v.number(),
        icon: v.string(),
      })
    ),
  }).index("by_date", ["date"]),

  userQuests: defineTable({
    userId: v.id("users"),
    questId: v.string(),
    date: v.string(),
    progress: v.number(),
    completed: v.boolean(),
    claimed: v.boolean(),
  })
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_quest_date", ["userId", "questId", "date"]),

  tradingCards: defineTable({
    userId: v.id("users"),
    appId: v.number(),
    gameName: v.string(),
    cardName: v.string(),
    imageUrl: v.string(),
    rarity: v.string(),
    mintedAsNft: v.boolean(),
    nftAddress: v.optional(v.string()),
    nftTokenId: v.optional(v.string()),
    earnedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_nft_status", ["mintedAsNft"]),

  nftBoosts: defineTable({
    userId: v.id("users"),
    nftAddress: v.string(),
    boostPercentage: v.number(),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_nft", ["nftAddress"]),

  rewards: defineTable({
    name: v.string(),
    description: v.string(),
    pointsCost: v.number(),
    rewardType: v.string(), // "steam_wallet", "amazon", "nintendo"
    rewardValue: v.number(),
    imageUrl: v.string(),
    isActive: v.boolean(),
  }),

  rewardRedemptions: defineTable({
    userId: v.id("users"),
    rewardId: v.id("rewards"),
    rewardName: v.string(),
    pointsSpent: v.number(),
    code: v.optional(v.string()),
    status: v.string(), // "pending", "approved", "revealed"
    redeemedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  pointHistory: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    reason: v.string(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  wallets: defineTable({
    userId: v.id("users"),
    walletAddress: v.string(),
    walletType: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_address", ["walletAddress"]),
});
