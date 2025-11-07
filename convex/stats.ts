import { query } from "./_generated/server";

export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    // Count active players (users with Steam connected)
    const allUsers = await ctx.db.query("users").collect();
    const activePlayers = allUsers.filter(u => u.steamId).length;

    // Count total quests completed
    const allUserQuests = await ctx.db.query("userQuests").collect();
    const questsCompleted = allUserQuests.filter(q => q.completed).length;

    // Count NFTs minted
    const allCards = await ctx.db.query("tradingCards").collect();
    const nftsMinted = allCards.filter(c => c.mintedAsNft).length;

    // Calculate total rewards distributed
    const allRedemptions = await ctx.db
      .query("rewardRedemptions")
      .filter(q => q.eq(q.field("status"), "approved") || q.eq(q.field("status"), "revealed"))
      .collect();
    
    const rewardsDistributed = allRedemptions.reduce((sum, r) => {
      // Extract value from reward name (e.g., "$5 Steam Wallet" -> 5)
      const match = r.rewardName.match(/\$(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);

    return {
      activePlayers,
      questsCompleted,
      nftsMinted,
      rewardsDistributed,
    };
  },
});
