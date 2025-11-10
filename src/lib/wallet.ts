import { Connection, Transaction, SystemProgram, PublicKey, Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

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
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener?: (event: string, callback: (accounts: string[]) => void) => void;
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

// MetaMask functions
export async function connectMetaMask(): Promise<string> {
  if (!window.ethereum || !window.ethereum.isMetaMask) {
    throw new Error("MetaMask wallet not found. Please install MetaMask extension.");
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    }) as string[];
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found in MetaMask");
    }
    
    return accounts[0];
  } catch (error) {
    if (error instanceof Error && error.message.includes("User rejected")) {
      throw new Error("User rejected MetaMask connection");
    }
    throw new Error("Failed to connect MetaMask wallet");
  }
}

export async function disconnectMetaMask(): Promise<void> {
  // MetaMask doesn't have a programmatic disconnect
  // User must disconnect from MetaMask extension itself
  return;
}

export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && !!window.ethereum?.isMetaMask;
}

export async function getMetaMaskAccount(): Promise<string | null> {
  if (!window.ethereum?.isMetaMask) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    }) as string[];
    
    return accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
}

// CARV SVM Testnet RPC URL
const CARV_RPC_URL = "https://rpc.testnet.carv.io/rpc";

export async function createProfileCommentTransaction(
  profileUsername: string,
  commentContent: string
): Promise<{ signature: string; explorerUrl: string }> {
  if (!window.backpack) {
    throw new Error("Backpack wallet not found. Please install the Backpack extension.");
  }

  if (!window.backpack.publicKey) {
    throw new Error("Wallet not connected. Please connect your Backpack wallet first.");
  }

  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      const connection = new Connection(CARV_RPC_URL, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000,
      });
      const walletPubkey = new PublicKey(window.backpack.publicKey.toString());

      console.log(`Creating profile comment transaction on CARV SVM... (attempt ${retryCount + 1}/${maxRetries + 1})`);

      const transaction = new Transaction();

      // Small transfer to self (0.001 SOL)
      const lamports = 1000000; // 0.001 SOL
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: walletPubkey,
          toPubkey: walletPubkey,
          lamports,
        })
      );

      // Add comment metadata as memo
      const commentData = JSON.stringify({
        type: "PROFILE_COMMENT",
        timestamp: new Date().toISOString(),
        profileUsername,
        comment: commentContent.substring(0, 200),
        app: "PlayBeings",
      });
      
      const memoData = new TextEncoder().encode(commentData);
      
      transaction.add({
        keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: false }],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        data: Buffer.from(memoData),
      });

      // Set transaction metadata
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPubkey;

      console.log("Requesting Backpack approval for comment...");
      
      // Sign and send with Backpack
      const { signature } = await window.backpack.signAndSendTransaction(transaction);
      
      console.log("Comment transaction submitted! Tx:", signature);

      // Verify transaction on-chain (with extended timeout)
      const confirmationPromise = connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, "confirmed");
      
      // Add timeout to prevent hanging (60 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Transaction confirmation timeout")), 60000);
      });
      
      try {
        await Promise.race([confirmationPromise, timeoutPromise]);
        console.log("Comment transaction confirmed!");
      } catch (confirmError) {
        console.warn("Transaction confirmation timed out, but transaction was submitted:", signature);
      }
      
      const explorerUrl = `http://explorer.testnet.carv.io/tx/${signature}`;
      
      return { 
        signature, 
        explorerUrl,
      };
    } catch (error) {
      console.error(`Profile comment transaction failed (attempt ${retryCount + 1}):`, error);
      
      // If user cancelled, don't retry
      if (error instanceof Error) {
        if (error.message.includes("Plugin Closed") || 
            error.message.includes("User rejected") ||
            error.message.includes("User cancelled")) {
          throw new Error("Transaction cancelled by user");
        }
        
        if (error.message.includes("Insufficient funds")) {
          throw new Error("Insufficient SOL balance. You need at least 0.001 SOL for the transaction.");
        }
      }
      
      retryCount++;
      if (retryCount > maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }

  throw new Error("Failed to create comment transaction after multiple attempts");
}

export async function performDailyCheckInTransaction(): Promise<{ signature: string; explorerUrl: string }> {
  if (!window.backpack) {
    throw new Error("Backpack wallet not found. Please install the Backpack extension.");
  }

  if (!window.backpack.publicKey) {
    throw new Error("Wallet not connected. Please connect your Backpack wallet first.");
  }

  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      const connection = new Connection(CARV_RPC_URL, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000,
      });
      const walletPubkey = new PublicKey(window.backpack.publicKey.toString());

      console.log(`Creating daily check-in transaction on CARV SVM... (attempt ${retryCount + 1}/${maxRetries + 1})`);

      const transaction = new Transaction();

      // Small transfer to self (0.001 SOL)
      const lamports = 1000000; // 0.001 SOL
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: walletPubkey,
          toPubkey: walletPubkey,
          lamports,
        })
      );

      // Add check-in metadata as memo
      const checkInData = JSON.stringify({
        type: "DAILY_CHECK_IN",
        timestamp: new Date().toISOString(),
        app: "PlayBeings",
      });
      
      const memoData = new TextEncoder().encode(checkInData);
      
      transaction.add({
        keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: false }],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        data: Buffer.from(memoData),
      });

      // Set transaction metadata
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPubkey;

      console.log("Requesting Backpack approval for check-in...");
      
      // Sign and send with Backpack
      const { signature } = await window.backpack.signAndSendTransaction(transaction);
      
      console.log("Check-in transaction submitted! Tx:", signature);

      // Verify transaction on-chain (with extended timeout)
      const confirmationPromise = connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, "confirmed");
      
      // Add timeout to prevent hanging (60 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Transaction confirmation timeout")), 60000);
      });
      
      try {
        await Promise.race([confirmationPromise, timeoutPromise]);
        console.log("Check-in transaction confirmed!");
      } catch (confirmError) {
        console.warn("Transaction confirmation timed out, but transaction was submitted:", signature);
      }
      
      const explorerUrl = `http://explorer.testnet.carv.io/tx/${signature}`;
      
      return { 
        signature, 
        explorerUrl,
      };
    } catch (error) {
      console.error(`Daily check-in transaction failed (attempt ${retryCount + 1}):`, error);
      
      // If user cancelled, don't retry
      if (error instanceof Error) {
        if (error.message.includes("Plugin Closed") || 
            error.message.includes("User rejected") ||
            error.message.includes("User cancelled")) {
          throw new Error("Transaction cancelled by user");
        }
        
        if (error.message.includes("Insufficient funds")) {
          throw new Error("Insufficient SOL balance. You need at least 0.001 SOL for the transaction.");
        }
      }
      
      retryCount++;
      if (retryCount > maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }

  throw new Error("Failed to complete check-in transaction after multiple attempts");
}

export async function completeQuestTransaction(
  questTitle: string,
  pointsEarned: number
): Promise<{ signature: string; explorerUrl: string }> {
  if (!window.backpack) {
    throw new Error("Backpack wallet not found");
  }

  if (!window.backpack.publicKey) {
    throw new Error("Wallet not connected");
  }

  let retryCount = 0;
  const maxRetries = 2;
<<<<<<< HEAD

  while (retryCount <= maxRetries) {
    try {
      const connection = new Connection(CARV_RPC_URL, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000,
      });
      const walletPubkey = new PublicKey(window.backpack.publicKey.toString());

      console.log(`Creating quest completion transaction on CARV SVM... (attempt ${retryCount + 1}/${maxRetries + 1})`);

      const transaction = new Transaction();

      // Small transfer to self (0.001 SOL)
      const lamports = 1000000; // 0.001 SOL
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: walletPubkey,
          toPubkey: walletPubkey,
          lamports,
        })
      );

      // Add quest completion metadata as memo
      const questData = JSON.stringify({
        type: "QUEST_COMPLETED",
        timestamp: new Date().toISOString(),
        questTitle,
        pointsEarned,
        app: "PlayBeings",
      });
      
      const memoData = new TextEncoder().encode(questData);
      
      transaction.add({
        keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: false }],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        data: Buffer.from(memoData),
      });

      // Set transaction metadata
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPubkey;

      console.log("Requesting Backpack approval for quest completion...");
      
      // Sign and send with Backpack
      const { signature } = await window.backpack.signAndSendTransaction(transaction);
      
      console.log("Quest completion transaction submitted! Tx:", signature);

      // Verify transaction on-chain (with extended timeout)
      const confirmationPromise = connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, "confirmed");
      
      // Add timeout to prevent hanging (60 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Transaction confirmation timeout")), 60000);
      });
      
      try {
        await Promise.race([confirmationPromise, timeoutPromise]);
        console.log("Quest completion transaction confirmed!");
      } catch (confirmError) {
        // Transaction submitted but confirmation timed out
        // It might still be processing - return signature anyway
        console.warn("Transaction confirmation timed out, but transaction was submitted:", signature);
      }
      
      const explorerUrl = `http://explorer.testnet.carv.io/tx/${signature}`;
      
      return { 
        signature, 
        explorerUrl,
      };
    } catch (error) {
      console.error(`Quest completion transaction failed (attempt ${retryCount + 1}):`, error);
      
      // If user cancelled, don't retry
      if (error instanceof Error && 
          (error.message.includes("Plugin Closed") || 
           error.message.includes("User rejected"))) {
        throw error;
      }
      
      retryCount++;
      if (retryCount > maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }

  throw new Error("Failed to complete quest transaction after multiple attempts");
}

// Helper to create a transaction signer for Backpack
class BackpackSigner {
  publicKey: PublicKey;
  
  constructor(publicKey: PublicKey) {
    this.publicKey = publicKey;
  }
}

export async function deleteProfileCommentTransaction(
  commentId: string,
  profileUsername: string
): Promise<{ signature: string; explorerUrl: string }> {
  if (!window.backpack) {
    throw new Error("Backpack wallet not found. Please install the Backpack extension.");
  }

  if (!window.backpack.publicKey) {
    throw new Error("Wallet not connected. Please connect your Backpack wallet first.");
  }

  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      const connection = new Connection(CARV_RPC_URL, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000,
      });
      const walletPubkey = new PublicKey(window.backpack.publicKey.toString());

      console.log(`Creating comment deletion transaction on CARV SVM... (attempt ${retryCount + 1}/${maxRetries + 1})`);

      const transaction = new Transaction();

      // Small transfer to self (0.001 SOL)
      const lamports = 1000000; // 0.001 SOL
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: walletPubkey,
          toPubkey: walletPubkey,
          lamports,
        })
      );

      // Add deletion metadata as memo
      const deleteData = JSON.stringify({
        type: "DELETE_PROFILE_COMMENT",
        timestamp: new Date().toISOString(),
        commentId,
        profileUsername,
        app: "PlayBeings",
      });
      
      const memoData = new TextEncoder().encode(deleteData);
      
      transaction.add({
        keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: false }],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        data: Buffer.from(memoData),
      });

      // Set transaction metadata
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPubkey;

      console.log("Requesting Backpack approval for comment deletion...");
      
      // Sign and send with Backpack
      const { signature } = await window.backpack.signAndSendTransaction(transaction);
      
      console.log("Comment deletion transaction submitted! Tx:", signature);

      // Verify transaction on-chain (with extended timeout)
      const confirmationPromise = connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, "confirmed");
      
      // Add timeout to prevent hanging (60 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Transaction confirmation timeout")), 60000);
      });
      
      try {
        await Promise.race([confirmationPromise, timeoutPromise]);
        console.log("Comment deletion transaction confirmed!");
      } catch (confirmError) {
        console.warn("Transaction confirmation timed out, but transaction was submitted:", signature);
      }
      
      const explorerUrl = `http://explorer.testnet.carv.io/tx/${signature}`;
      
      return { 
        signature, 
        explorerUrl,
      };
    } catch (error) {
      console.error(`Comment deletion transaction failed (attempt ${retryCount + 1}):`, error);
      
      // If user cancelled, don't retry
      if (error instanceof Error) {
        if (error.message.includes("Plugin Closed") || 
            error.message.includes("User rejected") ||
            error.message.includes("User cancelled")) {
          throw new Error("Transaction cancelled by user");
        }
        
        if (error.message.includes("Insufficient funds")) {
          throw new Error("Insufficient SOL balance. You need at least 0.001 SOL for the transaction.");
        }
      }
      
      retryCount++;
      if (retryCount > maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
<<<<<<< HEAD
  }

  throw new Error("Failed to delete comment transaction after multiple attempts");
=======
    
    const explorerUrl = `http://explorer.testnet.carv.io/tx/${signature}`;
    
    return { 
      signature, 
      explorerUrl,
    };
  } catch (error) {
    console.error("Comment deletion transaction failed:", error);
    throw error;
=======

  while (retryCount <= maxRetries) {
    try {
      const connection = new Connection(CARV_RPC_URL, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000,
      });
      const walletPubkey = new PublicKey(window.backpack.publicKey.toString());

      console.log(`Creating quest completion transaction on CARV SVM... (attempt ${retryCount + 1}/${maxRetries + 1})`);

      const transaction = new Transaction();

      // Small transfer to self (0.001 SOL)
      const lamports = 1000000; // 0.001 SOL
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: walletPubkey,
          toPubkey: walletPubkey,
          lamports,
        })
      );

      // Add quest completion metadata as memo
      const questData = JSON.stringify({
        type: "QUEST_COMPLETED",
        timestamp: new Date().toISOString(),
        questTitle,
        pointsEarned,
        app: "PlayBeings",
      });
      
      const memoData = new TextEncoder().encode(questData);
      
      transaction.add({
        keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: false }],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        data: Buffer.from(memoData),
      });

      // Set transaction metadata
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPubkey;

      console.log("Requesting Backpack approval for quest completion...");
      
      // Sign and send with Backpack
      const { signature } = await window.backpack.signAndSendTransaction(transaction);
      
      console.log("Quest completion transaction submitted! Tx:", signature);

      // Verify transaction on-chain (with extended timeout)
      const confirmationPromise = connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, "confirmed");
      
      // Add timeout to prevent hanging (60 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Transaction confirmation timeout")), 60000);
      });
      
      try {
        await Promise.race([confirmationPromise, timeoutPromise]);
        console.log("Quest completion transaction confirmed!");
      } catch (confirmError) {
        // Transaction submitted but confirmation timed out
        // It might still be processing - return signature anyway
        console.warn("Transaction confirmation timed out, but transaction was submitted:", signature);
      }
      
      const explorerUrl = `http://explorer.testnet.carv.io/tx/${signature}`;
      
      return { 
        signature, 
        explorerUrl,
      };
    } catch (error) {
      console.error(`Quest completion transaction failed (attempt ${retryCount + 1}):`, error);
      
      // If user cancelled, don't retry
      if (error instanceof Error && 
          (error.message.includes("Plugin Closed") || 
           error.message.includes("User rejected"))) {
        throw error;
      }
      
      retryCount++;
      if (retryCount > maxRetries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
>>>>>>> e2316a1d8368855da6a56687891a143941741f71
  }

  throw new Error("Failed to complete quest transaction after multiple attempts");
>>>>>>> 6ad5368c65b6a7a85f4e7ef5f18e332c8723e16b
}

export async function mintNFTOnCARV(
  achievementName: string,
  achievementDescription: string,
  gameName: string,
  achievementImage: string
): Promise<{ signature: string; explorerUrl: string; mintAddress: string }> {
  if (!window.backpack) {
    throw new Error("Backpack wallet not found. Please install the Backpack extension.");
  }

  if (!window.backpack.publicKey) {
    throw new Error("Wallet not connected. Please connect your Backpack wallet first.");
  }

  // NFT minting is complex, only retry once on network errors
  let retryCount = 0;
  const maxRetries = 1;

  while (retryCount <= maxRetries) {
    try {
    const connection = new Connection(CARV_RPC_URL, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    });
    const walletPubkey = new PublicKey(window.backpack.publicKey.toString());

    console.log("Minting Achievement NFT on CARV SVM...");
    
    // Generate unique mint keypair for this NFT
    const mintKeypair = Keypair.generate();
    const mintAddress = mintKeypair.publicKey.toString();
    
    console.log("NFT Mint Address:", mintAddress);

    // Single transaction with all instructions
    const transaction = new Transaction();
    
    // 1. Create mint account (82 bytes for SPL Token Mint)
    const mintRent = await connection.getMinimumBalanceForRentExemption(82);
    
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: walletPubkey,
        newAccountPubkey: mintKeypair.publicKey,
        space: 82,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    // 2. Initialize mint (0 decimals = NFT)
    const initMintData = Buffer.alloc(67);
    initMintData[0] = 0; // InitializeMint instruction
    initMintData[1] = 0; // 0 decimals
    new Uint8Array(initMintData.buffer).set(walletPubkey.toBuffer(), 2); // Mint authority
    initMintData[34] = 1; // Option: Some
    new Uint8Array(initMintData.buffer).set(walletPubkey.toBuffer(), 35); // Freeze authority

    transaction.add({
      keys: [
        { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: false },
      ],
      programId: TOKEN_PROGRAM_ID,
      data: initMintData,
    });

    // 3. Create Associated Token Account
    const [ata] = PublicKey.findProgramAddressSync(
      [
        walletPubkey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
    );

    transaction.add({
      keys: [
        { pubkey: walletPubkey, isSigner: true, isWritable: true },
        { pubkey: ata, isSigner: false, isWritable: true },
        { pubkey: walletPubkey, isSigner: false, isWritable: false },
        { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      programId: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
      data: Buffer.from([]),
    });

    // 4. Mint 1 token to ATA
    const mintToData = Buffer.alloc(9);
    mintToData[0] = 7; // MintTo instruction
    mintToData.writeBigUInt64LE(BigInt(1), 1); // Amount: 1

    transaction.add({
      keys: [
        { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: ata, isSigner: false, isWritable: true },
        { pubkey: walletPubkey, isSigner: true, isWritable: false },
      ],
      programId: TOKEN_PROGRAM_ID,
      data: mintToData,
    });

    // 5. Add NFT metadata as memo (includes achievement details and image)
    const nftMetadata = JSON.stringify({
      name: achievementName,
      description: achievementDescription,
      game: gameName,
      image: achievementImage,
      type: "CARV_ACHIEVEMENT_NFT",
      attributes: [
        { trait_type: "Game", value: gameName },
        { trait_type: "Achievement", value: achievementName },
      ],
      minted_at: new Date().toISOString(),
    });
    
    transaction.add({
      keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: false }],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(nftMetadata, "utf-8"),
    });

    // Set transaction metadata
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPubkey;

    // Partially sign with mint keypair
    transaction.partialSign(mintKeypair);

    console.log("Requesting Backpack approval...");
    console.log("Mint Address (NFT):", mintAddress);
    
    // Sign and send with Backpack (single approval)
    const { signature } = await window.backpack.signAndSendTransaction(transaction);
    
    console.log("NFT Mint Transaction Submitted! Tx:", signature);
    console.log("Confirming NFT mint on-chain...");

    // Wait for confirmation with timeout
    const confirmationPromise = connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    }, "confirmed");
    
    // Add timeout to prevent hanging (60 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Transaction confirmation timeout")), 60000);
    });
    
    try {
      await Promise.race([confirmationPromise, timeoutPromise]);
      console.log("NFT Mint confirmed on CARV SVM!");
      console.log("NFT successfully minted at address:", mintAddress);
    } catch (confirmError) {
      console.warn("NFT mint confirmation timed out, but transaction was submitted:", signature);
      console.log("NFT should be available at:", mintAddress);
    }

    const explorerUrl = `http://explorer.testnet.carv.io/tx/${signature}`;
    
    console.log("NFT Mint Complete!");
    console.log("- Mint Address:", mintAddress);
    console.log("- Transaction:", signature);
    console.log("- Explorer:", explorerUrl);
    
      return { 
        signature, 
        explorerUrl,
        mintAddress
      };
    } catch (error) {
      console.error(`NFT minting failed (attempt ${retryCount + 1}):`, error);
      
      // If user cancelled, don't retry
      if (error instanceof Error) {
        if (error.message.includes("Plugin Closed") || 
            error.message.includes("User rejected") ||
            error.message.includes("User cancelled")) {
          throw new Error("Transaction cancelled by user");
        }
        
        if (error.message.includes("Insufficient funds")) {
          throw new Error("Insufficient SOL balance. You need SOL for the transaction and rent.");
        }
      }
      
      retryCount++;
      if (retryCount > maxRetries) {
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  throw new Error("Failed to mint NFT after multiple attempts");
}

export async function purchasePremiumPassTransaction(): Promise<{ signature: string; explorerUrl: string }> {
  if (!window.backpack) {
    throw new Error("Backpack wallet not found. Please install the Backpack extension.");
  }

  if (!window.backpack.publicKey) {
    throw new Error("Wallet not connected. Please connect your Backpack wallet first.");
  }

  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      const connection = new Connection(CARV_RPC_URL, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000,
      });
      const walletPubkey = new PublicKey(window.backpack.publicKey.toString());

      console.log(`Creating Premium Pass purchase transaction on CARV SVM... (attempt ${retryCount + 1}/${maxRetries + 1})`);

      const transaction = new Transaction();

      // Transfer 0.05 SOL to PlayBeings treasury (premium pass payment)
      const treasuryAddress = new PublicKey("8ZeTZaujAWzR8UkLsXGeo8LSd8LoBgkTzXdGEbAjRAjk");
      const lamports = 50000000; // 0.05 SOL
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: walletPubkey,
          toPubkey: treasuryAddress,
          lamports,
        })
      );

      // Add premium pass metadata as memo
      const purchaseData = JSON.stringify({
        type: "PREMIUM_PASS_PURCHASE",
        timestamp: new Date().toISOString(),
        amount: "0.05 SOL",
        duration: "30 days",
        app: "PlayBeings",
      });
      
      const memoData = new TextEncoder().encode(purchaseData);
      
      transaction.add({
        keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: false }],
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        data: Buffer.from(memoData),
      });

      // Set transaction metadata
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletPubkey;

      console.log("Requesting Backpack approval for Premium Pass purchase...");
      
      // Sign and send with Backpack
      const { signature } = await window.backpack.signAndSendTransaction(transaction);
      
      console.log("Premium Pass purchase transaction submitted! Tx:", signature);

      // Verify transaction on-chain (with extended timeout)
      const confirmationPromise = connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, "confirmed");
      
      // Add timeout to prevent hanging (60 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Transaction confirmation timeout")), 60000);
      });
      
      try {
        await Promise.race([confirmationPromise, timeoutPromise]);
        console.log("Premium Pass purchase transaction confirmed!");
      } catch (confirmError) {
        console.warn("Transaction confirmation timed out, but transaction was submitted:", signature);
      }
      
      const explorerUrl = `http://explorer.testnet.carv.io/tx/${signature}`;
      
      return { 
        signature, 
        explorerUrl,
      };
    } catch (error) {
      console.error(`Premium Pass purchase transaction failed (attempt ${retryCount + 1}):`, error);
      
      // If user cancelled, don't retry
      if (error instanceof Error) {
        if (error.message.includes("Plugin Closed") || 
            error.message.includes("User rejected") ||
            error.message.includes("User cancelled")) {
          throw new Error("İşlem iptal edildi");
        }
        
        // Check for insufficient balance (check both common error patterns)
        if (error.message.includes("Insufficient funds") || 
            error.message.includes("insufficient lamports") ||
            error.message.toLowerCase().includes("insufficient")) {
          throw new Error("Yetersiz SOL bakiyesi. Premium Pass satın almak için en az 0.05 SOL gerekli. Lütfen cüzdanınıza CARV SVM Testnet SOL ekleyin.");
        }
        
        if (error.message.includes("blockhash")) {
          throw new Error("Ağ hatası. Lütfen tekrar deneyin.");
        }
      }
      
      retryCount++;
      if (retryCount > maxRetries) {
        // Final error - provide helpful message
        throw new Error("Premium Pass satın alınamadı. Lütfen cüzdanınızda yeterli SOL olduğundan emin olun (en az 0.05 SOL gerekli).");
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }

  throw new Error("Premium Pass satın alınamadı. Lütfen cüzdanınızda yeterli SOL olduğundan emin olun.");
}

export async function claimPremiumQuestTransaction(
  questTitle: string,
  dayNumber: number
): Promise<{ signature: string; explorerUrl: string }> {
  if (!window.backpack) {
    throw new Error("Backpack wallet not found. Please install the Backpack extension.");
  }

  if (!window.backpack.publicKey) {
    throw new Error("Wallet not connected. Please connect your Backpack wallet first.");
  }

  try {
    const connection = new Connection(CARV_RPC_URL, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60000,
    });
    const walletPubkey = new PublicKey(window.backpack.publicKey.toString());

    console.log("Creating premium quest claim transaction on CARV SVM...");

    const transaction = new Transaction();

    // Small transfer to self (0.001 SOL)
    const lamports = 1000000; // 0.001 SOL
    
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: walletPubkey,
        toPubkey: walletPubkey,
        lamports,
      })
    );

    // Add quest claim metadata as memo
    const claimData = JSON.stringify({
      type: "PREMIUM_QUEST_CLAIM",
      timestamp: new Date().toISOString(),
      questTitle,
      dayNumber,
      app: "PlayBeings",
    });
    
    const memoData = new TextEncoder().encode(claimData);
    
    transaction.add({
      keys: [{ pubkey: walletPubkey, isSigner: true, isWritable: false }],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(memoData),
    });

    // Set transaction metadata
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletPubkey;

    console.log("Requesting Backpack approval for premium quest claim...");
    
    // Sign and send with Backpack
    const { signature } = await window.backpack.signAndSendTransaction(transaction);
    
    console.log("Premium quest claim transaction submitted! Tx:", signature);

    // Verify transaction on-chain (with extended timeout)
    const confirmationPromise = connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    }, "confirmed");
    
    // Add timeout to prevent hanging (60 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Transaction confirmation timeout")), 60000);
    });
    
    try {
      await Promise.race([confirmationPromise, timeoutPromise]);
      console.log("Premium quest claim transaction confirmed!");
    } catch (confirmError) {
      console.warn("Transaction confirmation timed out, but transaction was submitted:", signature);
    }
    
    const explorerUrl = `http://explorer.testnet.carv.io/tx/${signature}`;
    
    return { 
      signature, 
      explorerUrl,
    };
  } catch (error) {
    console.error("Premium quest claim transaction failed:", error);
    
    // Provide better error messages
    if (error instanceof Error) {
      if (error.message.includes("Plugin Closed") || error.message.includes("User rejected")) {
        throw new Error("Transaction cancelled by user");
      } else if (error.message.includes("Insufficient funds")) {
        throw new Error("Insufficient SOL balance. You need at least 0.001 SOL for the transaction.");
      } else if (error.message.includes("blockhash")) {
        throw new Error("Network error. Please try again.");
      }
    }
    
    throw error;
  }
}
