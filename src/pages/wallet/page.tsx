import { Authenticated, AuthLoading } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { WalletConnect } from "./_components/wallet-connect.tsx";
import { WalletInfo } from "./_components/wallet-info.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";

export default function Wallet() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <WalletContent />
      </Authenticated>
    </>
  );
}

function WalletContent() {
  const steamProfile = useQuery(api.profiles.getSteamProfile);
  const connectedWallet = useQuery(api.wallets.getConnectedWallet);

  if (connectedWallet === undefined || steamProfile === undefined) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!steamProfile) {
    return (
      <DashboardLayout>
        <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 text-center space-y-6">
          <div className="w-16 h-16 rounded bg-black/40 border-2 border-[var(--neon-cyan)] flex items-center justify-center neon-glow-cyan mx-auto">
            <span className="text-3xl">💼</span>
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider mb-2">Steam hesabınızı bağlayın</h2>
            <p className="text-muted-foreground uppercase tracking-wide">
              Cüzdan bağlamak için önce Steam hesabınızı bağlamanız gerekiyor
            </p>
          </div>
          <a href="/dashboard">
            <Button className="glass-card border-2 border-[var(--neon-magenta)] hover:neon-glow-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 font-bold uppercase tracking-wider">
              Dashboard'a Git
            </Button>
          </a>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>
              Connect your Backpack wallet to mint NFTs on CARV SVM Testnet
            </CardDescription>
          </CardHeader>
        </Card>

        {connectedWallet ? (
          <WalletInfo wallet={connectedWallet} />
        ) : (
          <WalletConnect />
        )}
      </div>
    </DashboardLayout>
  );
}
