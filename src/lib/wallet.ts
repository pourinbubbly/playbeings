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

// Helper to create a transaction signer for Backpack
class BackpackSigner {
  publicKey: PublicKey;
  
  constructor(publicKey: PublicKey) {
    this.publicKey = publicKey;
  }
}

export async function mintNFTOnCARV(
  achievementName: string,
  achievementDescription: string,
  gameName: string
): Promise<{ signature: string; explorerUrl: string; mintAddress: string }> {
  if (!window.backpack) {
    throw new Error("Backpack wallet not found");
  }

  if (!window.backpack.publicKey) {
    throw new Error("Wallet not connected");
  }

  try {
    const connection = new Connection(CARV_RPC_URL, "confirmed");
    const walletPubkey = new PublicKey(window.backpack.publicKey.toString());

    console.log("Creating NFT mint on CARV SVM Testnet...");
    
    // Generate a new mint keypair
    const mintKeypair = Keypair.generate();
    
    console.log("Mint address:", mintKeypair.publicKey.toString());

    // Step 1: Create the mint account (0 decimals = NFT)
    const createMintTx = new Transaction();
    
    // Calculate rent for mint account
    const mintRent = await connection.getMinimumBalanceForRentExemption(82);
    
    // Create mint account
    createMintTx.add(
      SystemProgram.createAccount({
        fromPubkey: walletPubkey,
        newAccountPubkey: mintKeypair.publicKey,
        space: 82,
        lamports: mintRent,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    // Initialize mint
    const initMintData = Buffer.alloc(67);
    initMintData[0] = 0; // InitializeMint instruction
    initMintData[1] = 0; // 0 decimals (NFT)
    walletPubkey.toBuffer().copy(initMintData, 2); // Mint authority
    initMintData[34] = 1; // Option: Some
    walletPubkey.toBuffer().copy(initMintData, 35); // Freeze authority

    createMintTx.add({
      keys: [
        { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: false },
      ],
      programId: TOKEN_PROGRAM_ID,
      data: initMintData,
    });

    // Add metadata memo
    const memoData = JSON.stringify({
      type: "ACHIEVEMENT_NFT",
      name: achievementName,
      description: achievementDescription,
      game: gameName,
      timestamp: Date.now(),
    });
    
    createMintTx.add({
      keys: [
        { pubkey: walletPubkey, isSigner: true, isWritable: false },
      ],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(memoData, "utf-8"),
    });

    // Set recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    createMintTx.recentBlockhash = blockhash;
    createMintTx.feePayer = walletPubkey;

    // Partially sign with mint keypair
    createMintTx.partialSign(mintKeypair);

    console.log("Requesting wallet approval for mint creation...");
    
    // Sign and send with Backpack
    const { signature: createSig } = await window.backpack.signAndSendTransaction(createMintTx);
    
    console.log("Mint created! Signature:", createSig);

    // Wait for confirmation
    await connection.confirmTransaction({
      signature: createSig,
      blockhash,
      lastValidBlockHeight,
    }, "confirmed");

    // Step 2: Create associated token account and mint 1 token
    const mintToTx = new Transaction();

    // Derive associated token account
    const [ata] = PublicKey.findProgramAddressSync(
      [
        walletPubkey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
    );

    // Create ATA instruction
    mintToTx.add({
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

    // Mint 1 token
    const mintToData = Buffer.alloc(9);
    mintToData[0] = 7; // MintTo instruction
    mintToData.writeBigUInt64LE(BigInt(1), 1); // Amount: 1

    mintToTx.add({
      keys: [
        { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: ata, isSigner: false, isWritable: true },
        { pubkey: walletPubkey, isSigner: true, isWritable: false },
      ],
      programId: TOKEN_PROGRAM_ID,
      data: mintToData,
    });

    const { blockhash: mintBlockhash, lastValidBlockHeight: mintLastValid } = await connection.getLatestBlockhash("confirmed");
    mintToTx.recentBlockhash = mintBlockhash;
    mintToTx.feePayer = walletPubkey;

    console.log("Minting NFT to your wallet...");
    
    const { signature: mintSig } = await window.backpack.signAndSendTransaction(mintToTx);
    
    console.log("NFT minted! Signature:", mintSig);

    await connection.confirmTransaction({
      signature: mintSig,
      blockhash: mintBlockhash,
      lastValidBlockHeight: mintLastValid,
    }, "confirmed");

    const explorerUrl = `https://explorer.testnet.carv.io/tx/${mintSig}`;
    
    return { 
      signature: mintSig, 
      explorerUrl,
      mintAddress: mintKeypair.publicKey.toString()
    };
  } catch (error) {
    console.error("NFT minting error:", error);
    throw error;
  }
}
