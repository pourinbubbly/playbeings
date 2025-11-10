import { Authenticated, AuthLoading } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { WalletConnect } from "./_components/wallet-connect.tsx";
import { WalletInfo } from "./_components/wallet-info.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";

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
  const connectedWallet = useQuery(api.wallets.getConnectedWallet);

  if (connectedWallet === undefined) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallets</CardTitle>
            <CardDescription>
              Connect Backpack for CARV SVM transactions and MetaMask for CARV D.A.T.A. Framework
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
