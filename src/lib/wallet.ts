declare global {
  interface Window {
    backpack?: {
      isBackpack: boolean;
      connect: () => Promise<{ publicKey: string }>;
      disconnect: () => Promise<void>;
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
    return response.publicKey;
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
