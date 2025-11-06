import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const initializeTodayQuests = mutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];

    // Check if quests exist for today
    const existing = await ctx.db
      .query("dailyQuests")
      .withIndex("by_date", (q) => q.eq("date", today))
      .unique();

    if (existing) {
      return { success: true, created: false };
    }

    // Generate quests
    await ctx.scheduler.runAfter(0, internal.quests.generateDailyQuests, {
      date: today,
    });

    return { success: true, created: true };
  },
});
