import { Authenticated, AuthLoading } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SteamConnect } from "./_components/steam-connect.tsx";
import { DashboardLayout } from "./_components/dashboard-layout.tsx";
import { ProfileOverview } from "./_components/profile-overview.tsx";
import { GamesLibrary } from "./_components/games-library.tsx";

export default function Dashboard() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <DashboardContent />
      </Authenticated>
    </>
  );
}

function DashboardContent() {
  const steamProfile = useQuery(api.profiles.getSteamProfile);
  const currentUser = useQuery(api.users.getCurrentUser);

  if (steamProfile === undefined || currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-20 w-64" />
      </div>
    );
  }

  if (!steamProfile) {
    return <SteamConnect />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProfileOverview profile={steamProfile} user={currentUser} />
        <GamesLibrary />
      </div>
    </DashboardLayout>
  );
}
