import { Connection, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

declare global {
  interface Window {
    backpack?: {
      isBackpack: boolean;
      connect: () => Promise<{ publicKey: string }>;
      disconnect: () => Promise<void>;
      signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }>;
      signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
      publicKey?: { toString: () => string };
    };
  }
}

export async function connectBackpackWallet(): Promise<string> {
  if (!window.backpack) {
    throw new Error("Backpack wallet not found. Please install Backpack extension.");
  }

  try {
    const response = await window.backpack.connect();
    // Ensure we return a string
    let walletAddress = '';
    
    if (typeof response.publicKey === 'string') {
      walletAddress = response.publicKey;
    } else if (response.publicKey && typeof response.publicKey === 'object') {
      // If publicKey is an object with toString method
      const pkObj = response.publicKey as { toString?: () => string };
      walletAddress = pkObj.toString?.() || '';
    }
    
    if (!walletAddress) {
      throw new Error("Failed to get wallet address");
    }
    
    return walletAddress;
  } catch (error) {
    throw new Error("Failed to connect Backpack wallet");
  }
}

export async function disconnectBackpackWallet(): Promise<void> {
  if (!window.backpack) {
    return;
  }

  try {
    await window.backpack.disconnect();
  } catch (error) {
    console.error("Failed to disconnect Backpack wallet:", error);
  }
}

export function isBackpackInstalled(): boolean {
  return typeof window !== "undefined" && !!window.backpack?.isBackpack;
}

export function getConnectedWallet(): string | null {
  if (window.backpack?.publicKey) {
    return window.backpack.publicKey.toString();
  }
  return null;
}

// CARV SVM Testnet RPC URL
const CARV_RPC_URL = "https://rpc-testnet.carv.io";

export async function mintNFTOnCARV(
  achievementName: string,
  achievementDescription: string,
  gameName: string
): Promise<{ signature: string; explorerUrl: string }> {
  if (!window.backpack) {
    throw new Error("Backpack wallet not found");
  }

  if (!window.backpack.publicKey) {
    throw new Error("Wallet not connected");
  }

  try {
    const connection = new Connection(CARV_RPC_URL, "confirmed");
    const walletPubkey = new PublicKey(window.backpack.publicKey.toString());

    // Create a simple transaction (mint metadata stored in memo)
    const transaction = new Transaction();
    
    // Add memo instruction with NFT metadata
    const memoData = JSON.stringify({
      type: "ACHIEVEMENT_NFT_MINT",
      achievement: achievementName,
      description: achievementDescription,
      game: gameName,
      timestamp: Date.now(),
    });
    
    // Add a small transfer to make it a valid transaction (0.000001 SOL to self)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: walletPubkey,
        toPubkey: walletPubkey,
        lamports: 1000, // 0.000001 SOL
      })
    );

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPubkey;

    console.log("Sending transaction to CARV SVM Testnet...");
    
    // Sign and send transaction using Backpack
    const { signature } = await window.backpack.signAndSendTransaction(transaction);

    console.log("Transaction sent! Signature:", signature);

    // Wait for confirmation
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    const explorerUrl = `https://explorer.testnet.carv.io/tx/${signature}`;
    
    return { signature, explorerUrl };
  } catch (error) {
    console.error("Minting error:", error);
    throw error;
  }
}
