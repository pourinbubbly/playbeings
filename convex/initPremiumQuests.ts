import { mutation } from "./_generated/server";

export const initializePremiumQuests = mutation({
  args: {},
  handler: async (ctx) => {
    const currentMonth = new Date().toISOString().slice(0, 7); // "2025-11"

    // Check if already initialized
    const existing = await ctx.db
      .query("premiumQuests")
      .withIndex("by_month", (q) => q.eq("month", currentMonth))
      .first();

    if (existing) {
      console.log("Premium quests already initialized for this month");
      return { success: true, message: "Already initialized" };
    }

    // Create premium quests
    await ctx.db.insert("premiumQuests", {
      month: currentMonth,
      quests: [
        {
          id: "premium_playtime_3h",
          type: "playtime",
          title: "Play 3 Hours",
          description: "Play any game for 3 hours total",
          requirement: 3,
          rewardType: "emoji",
          rewardData: "🎮",
          icon: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop",
        },
        {
          id: "premium_playtime_10h",
          type: "playtime",
          title: "Play 10 Hours",
          description: "Play any game for 10 hours total",
          requirement: 10,
          rewardType: "emoji",
          rewardData: "🔥",
          icon: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop",
        },
        {
          id: "premium_playtime_25h",
          type: "playtime",
          title: "Play 25 Hours",
          description: "Play any game for 25 hours total",
          requirement: 25,
          rewardType: "emoji",
          rewardData: "⭐",
          icon: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop",
        },
        {
          id: "premium_checkin_7",
          type: "checkin",
          title: "7-Day Streak",
          description: "Check in for 7 consecutive days",
          requirement: 7,
          rewardType: "emoji",
          rewardData: "💎",
          icon: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=400&fit=crop",
        },
        {
          id: "premium_checkin_15",
          type: "checkin",
          title: "15-Day Streak",
          description: "Check in for 15 consecutive days",
          requirement: 15,
          rewardType: "emoji",
          rewardData: "👑",
          icon: "https://images.unsplash.com/photo-1604689599212-e2bb5d8e5e4d?w=400&h=400&fit=crop",
        },
        {
          id: "premium_checkin_30",
          type: "checkin",
          title: "30-Day Streak",
          description: "Check in for 30 consecutive days",
          requirement: 30,
          rewardType: "emoji",
          rewardData: "🏆",
          icon: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        },
        {
          id: "premium_playtime_50h",
          type: "playtime",
          title: "Play 50 Hours",
          description: "Play any game for 50 hours total - Ultimate gamer!",
          requirement: 50,
          rewardType: "emoji",
          rewardData: "🚀",
          icon: "https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400&h=400&fit=crop",
        },
        {
          id: "premium_playtime_100h",
          type: "playtime",
          title: "Play 100 Hours",
          description: "Play any game for 100 hours total - Legendary!",
          requirement: 100,
          rewardType: "emoji",
          rewardData: "💫",
          icon: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop",
        },
      ],
    });

    return { success: true, message: "Premium quests initialized" };
  },
});
