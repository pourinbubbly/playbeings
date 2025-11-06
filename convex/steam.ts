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
          imageUrl: `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
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
          imageUrl: `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
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
      // Get Steam inventory (753 is Steam Community item appid)
      const inventoryResponse = await fetch(
        `https://steamcommunity.com/inventory/${args.steamId}/753/6?l=english&count=5000`
      );
      
      if (!inventoryResponse.ok) {
        throw new Error("Failed to fetch inventory");
      }

      const inventoryData = await inventoryResponse.json();
      
      if (!inventoryData.assets || !inventoryData.descriptions) {
        return [];
      }

      // Match assets with descriptions to get trading cards
      const tradingCards = inventoryData.assets
        .map((asset: { classid: string; instanceid: string; amount: string }) => {
          const description = inventoryData.descriptions.find(
            (desc: { classid: string; instanceid: string }) =>
              desc.classid === asset.classid && desc.instanceid === asset.instanceid
          );
          return description ? { ...asset, ...description } : null;
        })
        .filter((item: { type?: string; tradable?: number }) => 
          item && 
          item.type && 
          item.type.includes("Trading Card") &&
          item.tradable === 1
        )
        .map((card: {
          classid: string;
          name: string;
          market_name: string;
          icon_url: string;
          type: string;
          app_name?: string;
        }) => ({
          classid: card.classid,
          name: card.name,
          marketName: card.market_name,
          imageUrl: `https://community.cloudflare.steamstatic.com/economy/image/${card.icon_url}`,
          type: card.type,
          gameName: card.app_name || "Unknown Game",
        }));

      return tradingCards;
    } catch (error) {
      console.error("Failed to fetch Steam inventory:", error);
      return [];
    }
  },
});
