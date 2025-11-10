"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const STEAM_API_KEY = "F657064ABD094E1D28A61975D9A6AB37";

interface SteamNewsItem {
  gid: string;
  title: string;
  url: string;
  author: string;
  contents: string;
  feedlabel: string;
  date: number;
  feedname: string;
  appid: number;
}

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
          imageUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/capsule_616x353.jpg`,
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
          imageUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/capsule_616x353.jpg`,
          lastPlayed: game.rtime_last_played || 0,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to sync Steam data: ${error}`);
    }
  },
});

export const getSteamAchievements = action({
  args: { steamId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log(`Fetching Steam achievements for Steam ID: ${args.steamId}`);
      
      // Get owned games
      const gamesResponse = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${args.steamId}&include_appinfo=1&include_played_free_games=1`
      );
      const gamesData = await gamesResponse.json();
      const games = gamesData.response.games || [];
      
      if (games.length === 0) {
        return [];
      }

      // Get top played games (most playtime)
      const topGames = games
        .filter((g: { playtime_forever: number }) => g.playtime_forever > 60)
        .sort((a: { playtime_forever: number }, b: { playtime_forever: number }) => b.playtime_forever - a.playtime_forever)
        .slice(0, 20);

      const achievements = [];
      
      for (const game of topGames) {
        try {
          const achievementsResponse = await fetch(
            `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${game.appid}&key=${STEAM_API_KEY}&steamid=${args.steamId}`
          );
          
          if (!achievementsResponse.ok) continue;
          
          const achievementsData = await achievementsResponse.json();
          
          if (achievementsData.playerstats && achievementsData.playerstats.achievements) {
            const gameAchievements = achievementsData.playerstats.achievements
              .filter((a: { achieved: number }) => a.achieved === 1)
              .slice(0, 5)
              .map((achievement: { apiname: string; name: string; description: string }) => ({
                id: `${game.appid}_${achievement.apiname}`,
                name: achievement.name || "Achievement",
                description: achievement.description || "Unlocked achievement",
                gameName: game.name,
                gameId: game.appid,
                imageUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/capsule_616x353.jpg`,
                iconUrl: `https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/${game.appid}/${achievement.apiname}.jpg`,
                rarity: Math.random() > 0.7 ? "Rare" : Math.random() > 0.4 ? "Uncommon" : "Common",
              }));
            
            achievements.push(...gameAchievements);
          }
        } catch (error) {
          console.log(`Failed to fetch achievements for game ${game.appid}:`, error);
          continue;
        }
        
        if (achievements.length >= 30) break;
      }

      console.log(`Found ${achievements.length} achievements`);
      return achievements;
    } catch (error) {
      console.error("Error fetching Steam achievements:", error);
      throw new Error(`Failed to fetch achievements: ${error}`);
    }
  },
});

export const getSteamInventory = action({
  args: { steamId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log(`Fetching ALL inventory items for Steam ID: ${args.steamId}`);
      
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

      // Helper function to determine rarity from tags and name color
      const getRarity = (item: { 
        tags?: Array<{ category?: string; name?: string; internal_name?: string }>;
        name_color?: string;
        type?: string;
      }) => {
        // Check tags for rarity
        const rarityTag = item.tags?.find(tag => tag.category === "droprate" || tag.category === "rarity");
        if (rarityTag?.name) {
          return rarityTag.name;
        }
        
        // Check name color (common pattern in Steam items)
        if (item.name_color) {
          const colorMap: Record<string, string> = {
            "D2D2D2": "Common",
            "B0C3D9": "Uncommon", 
            "5E98D9": "Rare",
            "4B69FF": "Mythical",
            "8847FF": "Legendary",
            "EB4B4B": "Immortal",
            "CF6A32": "Unique",
          };
          const upperColor = item.name_color.toUpperCase();
          if (colorMap[upperColor]) {
            return colorMap[upperColor];
          }
        }
        
        // Check type for foil cards
        if (item.type?.toLowerCase().includes("foil")) {
          return "Foil";
        }
        
        return "Common";
      };

      // Map ALL items from inventory
      console.log("Processing ALL inventory items...");
      const allItems = inventoryData.assets.map((asset: { classid: string; instanceid: string; amount: string; assetid: string }) => {
        const description = inventoryData.descriptions.find(
          (desc: { classid: string; instanceid: string }) =>
            desc.classid === asset.classid && desc.instanceid === asset.instanceid
        );
        return description ? { ...asset, ...description } : null;
      }).filter((item: unknown) => item !== null);
      
      console.log(`Total items in inventory: ${allItems.length}`);
      
      // Return ALL tradable items (not just trading cards)
      const inventoryItems = allItems
        .filter((item: { tradable?: number }) => item.tradable === 1)
        .map((item: {
          classid: string;
          assetid: string;
          name: string;
          market_name?: string;
          market_hash_name?: string;
          icon_url: string;
          type: string;
          name_color?: string;
          app_name?: string;
          tags?: Array<{ category?: string; name?: string; internal_name?: string }>;
        }) => ({
          classid: item.classid,
          assetid: item.assetid,
          name: item.name,
          marketName: item.market_name || item.market_hash_name || item.name,
          imageUrl: `https://community.cloudflare.steamstatic.com/economy/image/${item.icon_url}`,
          type: item.type,
          gameName: item.app_name || "Steam Community",
          rarity: getRarity(item),
        }));

      console.log(`Returning ${inventoryItems.length} tradable items from inventory`);
      return inventoryItems;
    } catch (error) {
      console.error("Failed to fetch Steam inventory:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to load inventory. Make sure your Steam profile and inventory are set to public.");
    }
  },
});

export const getGameDetails = action({
  args: { appId: v.number() },
  handler: async (ctx, args) => {
    try {
      console.log(`Fetching game details for App ID: ${args.appId}`);
      
      const response = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${args.appId}`
      );
      
      const data = await response.json();
      
      if (!data[args.appId]?.success) {
        throw new Error("Failed to fetch game details");
      }
      
      const gameData = data[args.appId].data;
      
      return {
        name: gameData.name,
        shortDescription: gameData.short_description || "",
        headerImage: gameData.header_image || "",
        developers: gameData.developers || [],
        publishers: gameData.publishers || [],
        releaseDate: gameData.release_date?.date || "Unknown",
        genres: gameData.genres?.map((g: { description: string }) => g.description) || [],
        price: gameData.price_overview?.final_formatted || "Free",
      };
    } catch (error) {
      console.error("Failed to fetch game details:", error);
      throw new Error("Failed to load game details");
    }
  },
});

export const getSteamNews = action({
  args: { steamId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log("Fetching Steam news for user's top games...");
      
      // Get user's owned games
      const gamesResponse = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${args.steamId}&include_appinfo=1`
      );
      const gamesData = await gamesResponse.json();
      
      if (!gamesData.response.games || gamesData.response.games.length === 0) {
        return [];
      }

      // Get top 10 most played games
      const topGames = gamesData.response.games
        .sort((a: { playtime_forever: number }, b: { playtime_forever: number }) => 
          b.playtime_forever - a.playtime_forever
        )
        .slice(0, 10);

      console.log("Fetching news for top games:", topGames.map((g: { name: string }) => g.name));

      // Fetch news for each game
      const newsPromises = topGames.map(async (game: { appid: number; name: string; img_icon_url: string }) => {
        try {
          const newsResponse = await fetch(
            `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${game.appid}&count=3&maxlength=300`
          );
          const newsData = await newsResponse.json();
          
          if (newsData.appnews?.newsitems) {
            return newsData.appnews.newsitems.map((item: SteamNewsItem) => ({
              id: item.gid,
              title: item.title,
              url: item.url,
              author: item.author,
              content: item.contents,
              date: item.date,
              feedName: item.feedname,
              appId: game.appid,
              gameName: game.name,
              gameIcon: `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
            }));
          }
          return [];
        } catch (error) {
          console.error(`Failed to fetch news for game ${game.appid}:`, error);
          return [];
        }
      });

      const allNews = await Promise.all(newsPromises);
      const flatNews = allNews.flat();
      
      // Sort by date (newest first) and return top 30
      const sortedNews = flatNews
        .sort((a, b) => b.date - a.date)
        .slice(0, 30);

      console.log(`Returning ${sortedNews.length} news items`);
      return sortedNews;
    } catch (error) {
      console.error("Failed to fetch Steam news:", error);
      throw new Error("Failed to load Steam news. Please try again.");
    }
  },
});

// Get top 30 most played games (only games with achievements)
export const getTopGames = action({
  args: { steamId: v.string() },
  handler: async (ctx, args) => {
    try {
      console.log(`Fetching top games for Steam ID: ${args.steamId}`);
      
      // Get owned games
      const gamesResponse = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${args.steamId}&include_appinfo=1&include_played_free_games=1`
      );
      const gamesData = await gamesResponse.json();
      const games = gamesData.response.games || [];
      
      if (games.length === 0) {
        return [];
      }

      // Get top played games (most playtime) with at least 1 hour playtime
      // We'll check more than 30 to filter out games without achievements
      const candidateGames = games
        .filter((g: { playtime_forever: number }) => g.playtime_forever > 60)
        .sort((a: { playtime_forever: number }, b: { playtime_forever: number }) => b.playtime_forever - a.playtime_forever)
        .slice(0, 50); // Check top 50 games

      console.log(`Checking ${candidateGames.length} games for achievements...`);

      // Filter games that have achievements
      const gamesWithAchievements = [];
      
      for (const game of candidateGames) {
        try {
          // Quick check if game has achievements
          const achievementsResponse = await fetch(
            `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${game.appid}&key=${STEAM_API_KEY}&steamid=${args.steamId}`
          );
          
          if (achievementsResponse.ok) {
            const achievementsData = await achievementsResponse.json();
            
            // Check if game has achievements and user has unlocked at least one
            if (achievementsData.playerstats && 
                achievementsData.playerstats.achievements && 
                achievementsData.playerstats.achievements.length > 0) {
              
              const hasUnlockedAchievements = achievementsData.playerstats.achievements.some(
                (a: { achieved: number }) => a.achieved === 1
              );
              
              if (hasUnlockedAchievements) {
                gamesWithAchievements.push({
                  appId: game.appid,
                  name: game.name,
                  playtime: game.playtime_forever,
                  imageUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/capsule_616x353.jpg`,
                });
              }
            }
          }
        } catch (error) {
          // Skip games that error out
          console.log(`Skipping game ${game.appid} - no achievements or error`);
          continue;
        }
        
        // Stop when we have 30 games with achievements
        if (gamesWithAchievements.length >= 30) {
          break;
        }
      }

      console.log(`Found ${gamesWithAchievements.length} games with unlocked achievements`);
      return gamesWithAchievements;
    } catch (error) {
      console.error("Error fetching top games:", error);
      throw new Error(`Failed to fetch games: ${error}`);
    }
  },
});

// Get achievements for a specific game
export const getGameAchievements = action({
  args: { 
    steamId: v.string(),
    appId: v.number(),
    gameName: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log(`Fetching achievements for game ${args.appId}`);
      
      const achievementsResponse = await fetch(
        `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${args.appId}&key=${STEAM_API_KEY}&steamid=${args.steamId}`
      );
      
      if (!achievementsResponse.ok) {
        throw new Error("Failed to fetch achievements for this game");
      }
      
      const achievementsData = await achievementsResponse.json();
      
      if (!achievementsData.playerstats || !achievementsData.playerstats.achievements) {
        return [];
      }

      const achievements = achievementsData.playerstats.achievements
        .filter((a: { achieved: number }) => a.achieved === 1)
        .map((achievement: { apiname: string; name: string; description: string }) => ({
          id: `${args.appId}_${achievement.apiname}`,
          name: achievement.name || "Achievement",
          description: achievement.description || "Unlocked achievement",
          gameName: args.gameName,
          gameId: args.appId,
          imageUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${args.appId}/capsule_616x353.jpg`,
          iconUrl: `https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/${args.appId}/${achievement.apiname}.jpg`,
          rarity: Math.random() > 0.7 ? "Rare" : Math.random() > 0.4 ? "Uncommon" : "Common",
        }));

      console.log(`Found ${achievements.length} achievements for game ${args.appId}`);
      return achievements;
    } catch (error) {
      console.error("Error fetching game achievements:", error);
      throw new Error(`Failed to fetch achievements: ${error}`);
    }
  },
});


