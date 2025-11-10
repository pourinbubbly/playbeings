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

    // Create 30 daily premium quests (one per day)
    const quests = [];
    
    for (let day = 1; day <= 30; day++) {
      const dayId = `premium_day_${day}`;
      let rewardType = "emoji";
      let rewardData = "🎮";
      let pointsReward = 0;
      
      // Add points every 5 days
      if (day % 5 === 0) {
        pointsReward = day === 5 ? 20 : day === 10 ? 50 : day === 15 ? 75 : day === 20 ? 100 : day === 25 ? 150 : 200;
        rewardType = "points";
        rewardData = pointsReward.toString();
      } else {
        // Assign unique emojis for other days
        const emojis = ["🎮", "🎯", "🔥", "⚡", "🌟", "💎", "🏆", "🚀", "💫", "👑", "🎪", "🎨", "🎭", "🎬", "🎤", "🎧", "🎹", "🥁", "🎺", "🎸", "🎻", "🎲", "🎰", "🎳"];
        rewardData = emojis[day % emojis.length];
      }
      
      quests.push({
        id: dayId,
        type: "daily_login",
        title: `Day ${day} Check-in`,
        description: day % 5 === 0 ? `Complete Day ${day} and earn ${pointsReward} bonus points!` : `Daily check-in for Day ${day}`,
        requirement: 1,
        dayNumber: day,
        rewardType,
        rewardData,
        pointsReward,
        icon: `https://images.unsplash.com/photo-${1511512578047 + day}?w=400&h=400&fit=crop`,
      });
    }

    await ctx.db.insert("premiumQuests", {
      month: currentMonth,
      quests,
    });

    return { success: true, message: "Premium quests initialized with 30 daily quests" };
  },
});
