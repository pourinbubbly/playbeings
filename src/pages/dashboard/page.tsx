import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SteamConnect } from "./_components/steam-connect.tsx";
import { DashboardLayout } from "./_components/dashboard-layout.tsx";
import { ProfileOverview } from "./_components/profile-overview.tsx";
import { GamesLibrary } from "./_components/games-library.tsx";
import { DailyQuestsSection } from "./_components/daily-quests-section.tsx";
import { DailyCheckInCard } from "./_components/checkin/daily-checkin-card.tsx";
import { UnauthenticatedPage } from "@/components/ui/unauthenticated-page.tsx";
import { AIRecommendations } from "@/components/ai-recommendations.tsx";
import { useEffect } from "react";

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
      <Unauthenticated>
        <UnauthenticatedPage />
      </Unauthenticated>
    </>
  );
}

function DashboardContent() {
  const steamProfile = useQuery(api.profiles.getSteamProfile, {});
  const currentUser = useQuery(api.users.getCurrentUser);
  const initQuests = useMutation(api.initQuests.initializeTodayQuests);

  useEffect(() => {
    initQuests();
  }, [initQuests]);

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
      <div className="space-y-8">
        <ProfileOverview profile={steamProfile} user={currentUser} />
        <DailyCheckInCard />
        {currentUser && <AIRecommendations userId={currentUser._id} />}
        <DailyQuestsSection />
        <GamesLibrary />
      </div>
    </DashboardLayout>
  );
}
