import { getConnectedWallet } from "./wallet.ts";
import { toast } from "sonner";

export function checkWalletConnection(): boolean {
  const walletAddress = getConnectedWallet();
  
  if (!walletAddress) {
    toast.error("Wallet Not Connected", {
      description: "Please connect your Backpack wallet to continue",
      duration: 5000,
      action: {
        label: "Go to Wallet",
        onClick: () => {
          window.location.href = "/dashboard/wallet";
        },
      },
    });
    return false;
  }
  
  return true;
}
