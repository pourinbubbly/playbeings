/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as cards from "../cards.js";
import type * as carv from "../carv.js";
import type * as carvMutations from "../carvMutations.js";
import type * as checkin from "../checkin.js";
import type * as community from "../community.js";
import type * as initPremiumQuests from "../initPremiumQuests.js";
import type * as initQuests from "../initQuests.js";
import type * as initRewards from "../initRewards.js";
import type * as initializeApp from "../initializeApp.js";
import type * as leaderboard from "../leaderboard.js";
import type * as messages from "../messages.js";
import type * as nft from "../nft.js";
import type * as notifications from "../notifications.js";
import type * as premium from "../premium.js";
import type * as premiumPass from "../premiumPass.js";
import type * as profiles from "../profiles.js";
import type * as quests from "../quests.js";
import type * as rewards from "../rewards.js";
import type * as stats from "../stats.js";
import type * as steam from "../steam.js";
import type * as steamQueries from "../steamQueries.js";
import type * as users from "../users.js";
import type * as wallets from "../wallets.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  cards: typeof cards;
  carv: typeof carv;
  carvMutations: typeof carvMutations;
  checkin: typeof checkin;
  community: typeof community;
  initPremiumQuests: typeof initPremiumQuests;
  initQuests: typeof initQuests;
  initRewards: typeof initRewards;
  initializeApp: typeof initializeApp;
  leaderboard: typeof leaderboard;
  messages: typeof messages;
  nft: typeof nft;
  notifications: typeof notifications;
  premium: typeof premium;
  premiumPass: typeof premiumPass;
  profiles: typeof profiles;
  quests: typeof quests;
  rewards: typeof rewards;
  stats: typeof stats;
  steam: typeof steam;
  steamQueries: typeof steamQueries;
  users: typeof users;
  wallets: typeof wallets;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
