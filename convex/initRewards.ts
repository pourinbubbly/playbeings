import { internalMutation } from "./_generated/server";

export const seedRewards = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if rewards already exist
    const existing = await ctx.db.query("rewards").first();
    if (existing) {
      return { message: "Rewards already seeded" };
    }

    // Seed initial rewards
    const rewards = [
      {
        name: "$5 Steam Wallet Code",
        description: "Add $5 to your Steam wallet",
        pointsCost: 500,
        rewardType: "steam_wallet",
        rewardValue: 5,
        imageUrl: "https://cdn.cloudflare.steamstatic.com/store/home/store_home_share.jpg",
        isActive: true,
      },
      {
        name: "$10 Steam Wallet Code",
        description: "Add $10 to your Steam wallet",
        pointsCost: 950,
        rewardType: "steam_wallet",
        rewardValue: 10,
        imageUrl: "https://cdn.cloudflare.steamstatic.com/store/home/store_home_share.jpg",
        isActive: true,
      },
      {
        name: "$25 Steam Wallet Code",
        description: "Add $25 to your Steam wallet",
        pointsCost: 2250,
        rewardType: "steam_wallet",
        rewardValue: 25,
        imageUrl: "https://cdn.cloudflare.steamstatic.com/store/home/store_home_share.jpg",
        isActive: true,
      },
      {
        name: "$10 Amazon Gift Card",
        description: "Redeem for $10 Amazon credit",
        pointsCost: 950,
        rewardType: "amazon",
        rewardValue: 10,
        imageUrl: "https://m.media-amazon.com/images/G/01/gc/designs/livepreview/amazon_dkblue_noto_email_v2016_us-main._CB468775337_.png",
        isActive: true,
      },
      {
        name: "$25 Amazon Gift Card",
        description: "Redeem for $25 Amazon credit",
        pointsCost: 2250,
        rewardType: "amazon",
        rewardValue: 25,
        imageUrl: "https://m.media-amazon.com/images/G/01/gc/designs/livepreview/amazon_dkblue_noto_email_v2016_us-main._CB468775337_.png",
        isActive: true,
      },
      {
        name: "$10 Nintendo eShop Card",
        description: "Add $10 to your Nintendo account",
        pointsCost: 950,
        rewardType: "nintendo",
        rewardValue: 10,
        imageUrl: "https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_2.0/c_scale,w_400/ncom/en_US/merchandising/buy-digital-games/eshop-cards/eshop-card-10",
        isActive: true,
      },
      {
        name: "$20 Nintendo eShop Card",
        description: "Add $20 to your Nintendo account",
        pointsCost: 1850,
        rewardType: "nintendo",
        rewardValue: 20,
        imageUrl: "https://assets.nintendo.com/image/upload/f_auto/q_auto/dpr_2.0/c_scale,w_400/ncom/en_US/merchandising/buy-digital-games/eshop-cards/eshop-card-20",
        isActive: true,
      },
    ];

    for (const reward of rewards) {
      await ctx.db.insert("rewards", reward);
    }

    return { message: "Rewards seeded successfully", count: rewards.length };
  },
});
