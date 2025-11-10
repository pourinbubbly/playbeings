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
    // Profile fields
    username: v.optional(v.string()),
    avatar: v.optional(v.string()),
    banner: v.optional(v.string()),
    bio: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      twitter: v.optional(v.string()),
      discord: v.optional(v.string()),
      twitch: v.optional(v.string()),
      youtube: v.optional(v.string()),
    })),
    // Stats
    followerCount: v.optional(v.number()),
    followingCount: v.optional(v.number()),
    currentStreak: v.optional(v.number()),
    longestStreak: v.optional(v.number()),
    lastCheckIn: v.optional(v.number()),
    // Premium Pass
    hasPremiumPass: v.optional(v.boolean()),
    premiumPassExpiry: v.optional(v.number()),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_steam_id", ["steamId"])
    .index("by_points", ["totalPoints"])
    .index("by_username", ["username"]),

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

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_follower_following", ["followerId", "followingId"]),

  profileComments: defineTable({
    profileUserId: v.id("users"),
    authorId: v.id("users"),
    content: v.string(),
    txHash: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_profile", ["profileUserId"])
    .index("by_author", ["authorId"]),

  dailyCheckIns: defineTable({
    userId: v.id("users"),
    date: v.string(),
    points: v.number(),
    streakDay: v.number(),
    txHash: v.optional(v.string()),
    txStatus: v.string(), // "pending", "confirmed", "failed"
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_date", ["date"]),

  conversations: defineTable({
    participant1: v.id("users"),
    participant2: v.id("users"),
    lastMessage: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    unreadCount1: v.number(), // unread for participant1
    unreadCount2: v.number(), // unread for participant2
  })
    .index("by_participant1", ["participant1"])
    .index("by_participant2", ["participant2"])
    .index("by_participants", ["participant1", "participant2"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"]),

  blocks: defineTable({
    blockerId: v.id("users"),
    blockedId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_blocker", ["blockerId"])
    .index("by_blocked", ["blockedId"])
    .index("by_blocker_blocked", ["blockerId", "blockedId"]),

  premiumPasses: defineTable({
    userId: v.id("users"),
    txHash: v.string(),
    purchaseDate: v.number(),
    expiryDate: v.number(),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_tx", ["txHash"]),

  premiumQuests: defineTable({
    month: v.string(), // "2025-01"
    quests: v.array(
      v.object({
        id: v.string(),
        type: v.string(), // "daily_login", "playtime", "achievements", "checkin"
        title: v.string(),
        description: v.string(),
        requirement: v.number(),
        dayNumber: v.optional(v.number()), // Day 1-30 for daily quests
        rewardType: v.string(), // "emoji", "sticker", "points"
        rewardData: v.string(), // emoji char or sticker URL or points amount
        pointsReward: v.optional(v.number()), // Bonus points for milestone days
        icon: v.string(),
      })
    ),
  }).index("by_month", ["month"]),

  userPremiumQuests: defineTable({
    userId: v.id("users"),
    questId: v.string(),
    month: v.string(),
    progress: v.number(),
    completed: v.boolean(),
    claimed: v.boolean(),
    txHash: v.optional(v.string()), // CARV SVM transaction hash for claiming
    rewardType: v.optional(v.string()),
    rewardData: v.optional(v.string()),
    claimedAt: v.optional(v.number()),
  })
    .index("by_user_and_month", ["userId", "month"])
    .index("by_user_quest_month", ["userId", "questId", "month"]),

  premiumRewards: defineTable({
    userId: v.id("users"),
    rewardType: v.string(), // "emoji", "sticker"
    rewardData: v.string(),
    earnedAt: v.number(),
  }).index("by_user", ["userId"]),

  customStickers: defineTable({
    userId: v.id("users"),
    stickerUrl: v.string(), // Storage ID for the uploaded sticker
    uploadedAt: v.number(),
  }).index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(), // "follow", "quest_complete", "message", "comment", "check_in"
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    link: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),
});
