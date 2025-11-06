"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Coinbase AgentKit configuration
const COINBASE_API_KEY = "617b118d-8aa3-4838-bb74-ed9c9d4321dc";
const COINBASE_API_SECRET = "rl7PIspG1xDmE0EZ5jWvHhEC2Ylg1DGnpPMhfKuDJ/ru5ollgW/Mz/r6lLb0GZsBUXHFJjB9mA/woGkGq8XNXw==";
const CARV_RPC_URL = "https://rpc.testnet.carv.io/rpc";

interface MintNFTRequest {
  cardId: string;
  walletAddress: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
}

export const mintTradingCardNFT = action({
  args: {
    cardId: v.id("tradingCards"),
    walletAddress: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    txHash: string;
    tokenId: string;
    metadata: MintNFTRequest["metadata"];
  }> => {
    try {
      // Get the trading card
      const card = await ctx.runQuery(api.cards.getCardById, {
        cardId: args.cardId,
      });

      if (!card) {
        throw new Error("Trading card not found");
      }

      if (card.mintedAsNft) {
        throw new Error("Card already minted as NFT");
      }

      // Prepare NFT metadata
      const metadata: MintNFTRequest["metadata"] = {
        name: `${card.gameName} - ${card.cardName}`,
        description: `Trading card from ${card.gameName}. Rarity: ${card.rarity}`,
        image: card.imageUrl,
        attributes: [
          { trait_type: "Game", value: card.gameName },
          { trait_type: "Card Name", value: card.cardName },
          { trait_type: "Rarity", value: card.rarity },
          { trait_type: "App ID", value: card.appId.toString() },
        ],
      };

      // Simulate NFT minting (In production, use Coinbase AgentKit)
      // For testnet demo, generate a mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
      const mockTokenId = Math.floor(Math.random() * 1000000).toString();

      // Update card as minted
      await ctx.runMutation(api.cards.markCardAsMinted, {
        cardId: args.cardId,
        nftAddress: args.walletAddress,
        nftTokenId: mockTokenId,
      });

      return {
        success: true,
        txHash: mockTxHash,
        tokenId: mockTokenId,
        metadata,
      };
    } catch (error) {
      throw new Error(`Failed to mint NFT: ${error}`);
    }
  },
});

export const estimateMintCost = action({
  args: {},
  handler: async (ctx, args) => {
    // Return estimated gas cost for minting on CARV SVM testnet
    return {
      estimatedGas: "0.001",
      currency: "CARV",
      usdValue: "~$0.00 (testnet)",
    };
  },
});

export const checkWalletBalance = action({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    try {
      // In production, query actual balance from CARV SVM
      // For demo, return mock balance
      return {
        balance: "10.0",
        currency: "CARV",
        hasEnoughForMinting: true,
      };
    } catch (error) {
      return {
        balance: "0",
        currency: "CARV",
        hasEnoughForMinting: false,
      };
    }
  },
});
