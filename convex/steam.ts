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
      console.log(`Fetching inventory for Steam ID: ${args.steamId}`);
      
      // First check profile privacy
      const profileResponse = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${args.steamId}`
      );
      const profileData = await profileResponse.json();
      
      if (!profileData.response.players || profileData.response.players.length === 0) {
        throw new Error("Steam profile not found. Please check your Steam ID.");
      }

      const player = profileData.response.players[0];
      console.log("Profile visibility state:", player.communityvisibilitystate);
      
      // communityvisibilitystate: 1 = private, 3 = public
      if (player.communityvisibilitystate !== 3) {
        throw new Error("Steam profile is private. Please set your profile to Public in Steam Privacy Settings.");
      }

      // Try to fetch inventory from Steam Community
      console.log("Fetching Steam Community inventory...");
      const inventoryResponse = await fetch(
        `https://steamcommunity.com/inventory/${args.steamId}/753/6?l=english&count=5000`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          }
        }
      );
      
      console.log("Inventory response status:", inventoryResponse.status);
      
      if (inventoryResponse.status === 403) {
        throw new Error("Steam inventory is private. Please set your inventory to Public in Steam Privacy Settings.");
      }
      
      if (inventoryResponse.status === 500) {
        throw new Error("Steam servers are experiencing issues. Please try again in a few minutes.");
      }
      
      if (!inventoryResponse.ok) {
        console.log("Failed to fetch inventory:", inventoryResponse.statusText);
        throw new Error(`Failed to fetch inventory: ${inventoryResponse.statusText}`);
      }
      
      const inventoryData = await inventoryResponse.json();
      console.log("Inventory data received:", {
        hasAssets: !!inventoryData.assets,
        assetsLength: inventoryData.assets?.length || 0,
        hasDescriptions: !!inventoryData.descriptions,
        descriptionsLength: inventoryData.descriptions?.length || 0,
        success: inventoryData.success,
      });
      
      if (!inventoryData.success) {
        throw new Error("Failed to load inventory. Steam API returned an error.");
      }
      
      if (!inventoryData.assets || !inventoryData.descriptions || inventoryData.assets.length === 0) {
        console.log("No items found in inventory");
        return [];
      }

      // Match assets with descriptions to get trading cards
      console.log("Processing inventory items...");
      const allItems = inventoryData.assets.map((asset: { classid: string; instanceid: string; amount: string; assetid: string }) => {
        const description = inventoryData.descriptions.find(
          (desc: { classid: string; instanceid: string }) =>
            desc.classid === asset.classid && desc.instanceid === asset.instanceid
        );
        return description ? { ...asset, ...description } : null;
      }).filter((item: unknown) => item !== null);
      
      console.log(`Total items in inventory: ${allItems.length}`);
      
      // Filter for trading cards
      const tradingCards = allItems.filter((item: { 
        type?: string; 
        tradable?: number; 
        tags?: Array<{ category?: string; name?: string; internal_name?: string }>;
      }) => {
        if (!item) return false;
        
        // Check type field for "Trading Card"
        const typeIsCard = item.type && item.type.toLowerCase().includes("trading card");
        
        // Check tags for item_class = Trading Card
        const hasCardTag = item.tags?.some(tag => 
          tag.category === "item_class" && (
            tag.name === "Trading Card" || 
            tag.internal_name === "item_class_2"
          )
        );
        
        // Must be tradable
        const isTradable = item.tradable === 1;
        
        const isCard = (typeIsCard || hasCardTag) && isTradable;
        
        return isCard;
      }).map((card: {
        classid: string;
        assetid: string;
        name: string;
        market_name?: string;
        market_hash_name?: string;
        icon_url: string;
        type: string;
        name_color?: string;
        app_name?: string;
      }) => ({
        classid: card.classid,
        assetid: card.assetid,
        name: card.name,
        marketName: card.market_name || card.market_hash_name || card.name,
        imageUrl: `https://community.cloudflare.steamstatic.com/economy/image/${card.icon_url}`,
        type: card.type,
        gameName: card.app_name || "Steam Community",
      }));

      console.log(`Found ${tradingCards.length} trading cards out of ${allItems.length} total items`);
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
