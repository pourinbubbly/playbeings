import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const initializeApp = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if rewards are already initialized
    const existingRewards = await ctx.db.query("rewards").first();
    
    if (!existingRewards) {
      // Seed rewards if they don't exist
      await ctx.scheduler.runAfter(0, internal.initRewards.seedRewards);
      return { message: "Initializing rewards..." };
    }
    
    return { message: "App already initialized" };
  },
});
