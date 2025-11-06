"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const STEAM_API_KEY = "B6C8913398574139C759399DE0F12064";

export const linkSteamAccount = action({
  args: { steamId: v.string() },
  handler: async (ctx, args) => {
    try {
      // Get Steam profile
      const profileResponse = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${args.steamId}`
      );
      const profileData = await profileResponse.json();

      if (!profileData.response.players || profileData.response.players.length === 0) {
        throw new Error("Steam profile not found");
      }

      const player = profileData.response.players[0];

      // Get owned games
      const gamesResponse = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${args.steamId}&include_appinfo=1&include_played_free_games=1`
      );
      const gamesData = await gamesResponse.json();

      const games = gamesData.response.games || [];
      const totalPlaytime = games.reduce(
        (sum: number, game: { playtime_forever: number }) => sum + game.playtime_forever,
        0
      );

      // Get achievements count
      let achievementCount = 0;
      for (const game of games.slice(0, 10)) {
        try {
          const achievementsResponse = await fetch(
            `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${game.appid}&key=${STEAM_API_KEY}&steamid=${args.steamId}`
          );
          const achievementsData = await achievementsResponse.json();
          if (achievementsData.playerstats && achievementsData.playerstats.achievements) {
            achievementCount += achievementsData.playerstats.achievements.filter(
              (a: { achieved: number }) => a.achieved === 1
            ).length;
          }
        } catch (error) {
          // Skip if game doesn't have achievements
        }
      }

      return {
        steamId: player.steamid,
        personaName: player.personaname,
        avatarUrl: player.avatarfull,
        profileUrl: player.profileurl,
        totalPlaytime,
        gameCount: games.length,
        achievementCount,
        games: games.map((game: {
          appid: number;
          name: string;
          playtime_forever: number;
          img_icon_url: string;
          rtime_last_played: number;
        }) => ({
          appId: game.appid,
          name: game.name,
          playtime: game.playtime_forever,
          imageUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_600x900_2x.jpg`,
          lastPlayed: game.rtime_last_played || 0,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to link Steam account: ${error}`);
    }
  },
});

export const syncSteamData = action({
  args: { steamId: v.string() },
  handler: async (ctx, args) => {
    try {
      // Get owned games
      const gamesResponse = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${args.steamId}&include_appinfo=1&include_played_free_games=1`
      );
      const gamesData = await gamesResponse.json();

      const games = gamesData.response.games || [];
      const totalPlaytime = games.reduce(
        (sum: number, game: { playtime_forever: number }) => sum + game.playtime_forever,
        0
      );

      return {
        games: games.map((game: {
          appid: number;
          name: string;
          playtime_forever: number;
          img_icon_url: string;
          rtime_last_played: number;
        }) => ({
          appId: game.appid,
          name: game.name,
          playtime: game.playtime_forever,
          imageUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_600x900_2x.jpg`,
          lastPlayed: game.rtime_last_played || 0,
        })),
        totalPlaytime,
        gameCount: games.length,
      };
    } catch (error) {
      throw new Error(`Failed to sync Steam data: ${error}`);
    }
  },
});

export const getSteamInventory = action({
  args: { steamId: v.string() },
  handler: async (ctx, args) => {
    try {
      // First check profile privacy
      const profileResponse = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${args.steamId}`
      );
      const profileData = await profileResponse.json();
      
      if (!profileData.response.players || profileData.response.players.length === 0) {
        throw new Error("Steam profile not found");
      }

      const player = profileData.response.players[0];
      console.log("Profile visibility:", player.communityvisibilitystate);

      // Try multiple contexts for Steam inventory
      const contexts = [6, 3, 1]; // Context 6 is for trading cards
      let inventoryData = null;
      let lastError = null;
      
      for (const context of contexts) {
        try {
          const inventoryResponse = await fetch(
            `https://steamcommunity.com/inventory/${args.steamId}/753/${context}?l=english&count=5000`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0',
              }
            }
          );
          
          if (inventoryResponse.status === 403) {
            throw new Error("Steam inventory is private. Please set your inventory to public in Steam Privacy Settings.");
          }
          
          if (inventoryResponse.ok) {
            const data = await inventoryResponse.json();
            if (data.assets && data.descriptions && data.assets.length > 0) {
              inventoryData = data;
              console.log(`Found inventory data in context ${context} with ${data.assets.length} items`);
              break;
            }
          }
        } catch (e) {
          lastError = e;
          console.log(`Failed to fetch with context ${context}:`, e);
        }
      }
      
      if (!inventoryData || !inventoryData.assets || !inventoryData.descriptions) {
        if (lastError instanceof Error && lastError.message.includes("private")) {
          throw lastError;
        }
        console.log("No inventory data found - inventory may be empty or private");
        return [];
      }

      // Match assets with descriptions to get trading cards
      const tradingCards = inventoryData.assets
        .map((asset: { classid: string; instanceid: string; amount: string; assetid: string }) => {
          const description = inventoryData.descriptions.find(
            (desc: { classid: string; instanceid: string }) =>
              desc.classid === asset.classid && desc.instanceid === asset.instanceid
          );
          return description ? { ...asset, ...description } : null;
        })
        .filter((item: { type?: string; tradable?: number; tags?: Array<{ category?: string; name?: string }> }) => {
          if (!item) return false;
          // Check if it's a trading card
          const isCard = item.type && (
            item.type.toLowerCase().includes("trading card") || 
            item.type.toLowerCase().includes("card")
          );
          const hasCardTag = item.tags?.some(tag => 
            tag.category === "item_class" && (
              tag.name === "Trading Card" || 
              tag.name?.toLowerCase().includes("card")
            )
          );
          return (isCard || hasCardTag) && item.tradable === 1;
        })
        .map((card: {
          classid: string;
          assetid: string;
          name: string;
          market_name: string;
          icon_url: string;
          type: string;
          app_name?: string;
          market_hash_name?: string;
        }) => ({
          classid: card.classid,
          assetid: card.assetid,
          name: card.name,
          marketName: card.market_name || card.market_hash_name || card.name,
          imageUrl: `https://community.cloudflare.steamstatic.com/economy/image/${card.icon_url}`,
          type: card.type,
          gameName: card.app_name || "Steam Community",
        }));

      console.log(`Found ${tradingCards.length} trading cards`);
      return tradingCards;
    } catch (error) {
      console.error("Failed to fetch Steam inventory:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to load inventory. Make sure your Steam profile and inventory are set to public.");
    }
  },
});
