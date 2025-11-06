import { internalMutation } from "./_generated/server";

export const seedRewards = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if rewards already exist
    const existing = await ctx.db.query("rewards").first();
    if (existing) {
      return { message: "Rewards already seeded" };
    }

    // Seed initial rewards with more variety
    const rewards = [
      // Steam Wallet Codes
      {
        name: "$5 Steam Wallet Code",
        description: "Add $5 to your Steam wallet",
        pointsCost: 500,
        rewardType: "steam_wallet",
        rewardValue: 5,
        imageUrl: "https://images.unsplash.com/photo-1596674470907-5120fe5fa715?w=400",
        isActive: true,
      },
      {
        name: "$10 Steam Wallet Code",
        description: "Add $10 to your Steam wallet",
        pointsCost: 950,
        rewardType: "steam_wallet",
        rewardValue: 10,
        imageUrl: "https://images.unsplash.com/photo-1596674470907-5120fe5fa715?w=400",
        isActive: true,
      },
      {
        name: "$25 Steam Wallet Code",
        description: "Add $25 to your Steam wallet",
        pointsCost: 2250,
        rewardType: "steam_wallet",
        rewardValue: 25,
        imageUrl: "https://images.unsplash.com/photo-1596674470907-5120fe5fa715?w=400",
        isActive: true,
      },
      {
        name: "$50 Steam Wallet Code",
        description: "Add $50 to your Steam wallet",
        pointsCost: 4500,
        rewardType: "steam_wallet",
        rewardValue: 50,
        imageUrl: "https://images.unsplash.com/photo-1596674470907-5120fe5fa715?w=400",
        isActive: true,
      },
      {
        name: "$100 Steam Wallet Code",
        description: "Add $100 to your Steam wallet",
        pointsCost: 9000,
        rewardType: "steam_wallet",
        rewardValue: 100,
        imageUrl: "https://images.unsplash.com/photo-1596674470907-5120fe5fa715?w=400",
        isActive: true,
      },
      // Amazon Gift Cards
      {
        name: "$10 Amazon Gift Card",
        description: "Redeem for $10 Amazon credit",
        pointsCost: 950,
        rewardType: "amazon",
        rewardValue: 10,
        imageUrl: "https://images.unsplash.com/photo-1704204656144-3dd12c110dd8?w=400",
        isActive: true,
      },
      {
        name: "$25 Amazon Gift Card",
        description: "Redeem for $25 Amazon credit",
        pointsCost: 2250,
        rewardType: "amazon",
        rewardValue: 25,
        imageUrl: "https://images.unsplash.com/photo-1704204656144-3dd12c110dd8?w=400",
        isActive: true,
      },
      {
        name: "$50 Amazon Gift Card",
        description: "Redeem for $50 Amazon credit",
        pointsCost: 4500,
        rewardType: "amazon",
        rewardValue: 50,
        imageUrl: "https://images.unsplash.com/photo-1704204656144-3dd12c110dd8?w=400",
        isActive: true,
      },
      {
        name: "$100 Amazon Gift Card",
        description: "Redeem for $100 Amazon credit",
        pointsCost: 9000,
        rewardType: "amazon",
        rewardValue: 100,
        imageUrl: "https://images.unsplash.com/photo-1704204656144-3dd12c110dd8?w=400",
        isActive: true,
      },
      // Nintendo eShop Cards
      {
        name: "$10 Nintendo eShop Card",
        description: "Add $10 to your Nintendo account",
        pointsCost: 950,
        rewardType: "nintendo",
        rewardValue: 10,
        imageUrl: "https://images.unsplash.com/photo-1562766879-ce73e9394f94?w=400",
        isActive: true,
      },
      {
        name: "$20 Nintendo eShop Card",
        description: "Add $20 to your Nintendo account",
        pointsCost: 1850,
        rewardType: "nintendo",
        rewardValue: 20,
        imageUrl: "https://images.unsplash.com/photo-1562766879-ce73e9394f94?w=400",
        isActive: true,
      },
      {
        name: "$35 Nintendo eShop Card",
        description: "Add $35 to your Nintendo account",
        pointsCost: 3200,
        rewardType: "nintendo",
        rewardValue: 35,
        imageUrl: "https://images.unsplash.com/photo-1562766879-ce73e9394f94?w=400",
        isActive: true,
      },
      {
        name: "$50 Nintendo eShop Card",
        description: "Add $50 to your Nintendo account",
        pointsCost: 4500,
        rewardType: "nintendo",
        rewardValue: 50,
        imageUrl: "https://images.unsplash.com/photo-1562766879-ce73e9394f94?w=400",
        isActive: true,
      },
      // PlayStation Store Cards
      {
        name: "$10 PlayStation Store Card",
        description: "Add $10 to your PlayStation wallet",
        pointsCost: 950,
        rewardType: "playstation",
        rewardValue: 10,
        imageUrl: "https://images.unsplash.com/photo-1678996569798-2662baf6d452?w=400",
        isActive: true,
      },
      {
        name: "$25 PlayStation Store Card",
        description: "Add $25 to your PlayStation wallet",
        pointsCost: 2250,
        rewardType: "playstation",
        rewardValue: 25,
        imageUrl: "https://images.unsplash.com/photo-1678996569798-2662baf6d452?w=400",
        isActive: true,
      },
      {
        name: "$50 PlayStation Store Card",
        description: "Add $50 to your PlayStation wallet",
        pointsCost: 4500,
        rewardType: "playstation",
        rewardValue: 50,
        imageUrl: "https://images.unsplash.com/photo-1678996569798-2662baf6d452?w=400",
        isActive: true,
      },
      // Xbox Gift Cards
      {
        name: "$10 Xbox Gift Card",
        description: "Add $10 to your Xbox account",
        pointsCost: 950,
        rewardType: "xbox",
        rewardValue: 10,
        imageUrl: "https://images.unsplash.com/photo-1662027008658-ae6e5aeeed47?w=400",
        isActive: true,
      },
      {
        name: "$25 Xbox Gift Card",
        description: "Add $25 to your Xbox account",
        pointsCost: 2250,
        rewardType: "xbox",
        rewardValue: 25,
        imageUrl: "https://images.unsplash.com/photo-1662027008658-ae6e5aeeed47?w=400",
        isActive: true,
      },
      {
        name: "$50 Xbox Gift Card",
        description: "Add $50 to your Xbox account",
        pointsCost: 4500,
        rewardType: "xbox",
        rewardValue: 50,
        imageUrl: "https://images.unsplash.com/photo-1662027008658-ae6e5aeeed47?w=400",
        isActive: true,
      },
    ];

    for (const reward of rewards) {
      await ctx.db.insert("rewards", reward);
    }

    return { message: "Rewards seeded successfully", count: rewards.length };
  },
});
