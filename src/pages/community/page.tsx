import { useState } from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { DashboardLayout } from "@/pages/dashboard/_components/dashboard-layout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar.tsx";
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Search, 
  MessageSquare,
  Sparkles,
  Trophy,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { UnauthenticatedPage } from "@/components/ui/unauthenticated-page.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";

export default function Community() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <CommunityContent />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedPage />
      </Unauthenticated>
    </>
  );
}

function CommunityContent() {
  const [activeTab, setActiveTab] = useState("discover");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  
  const currentUser = useQuery(api.users.getCurrentUser);
  const followers = useQuery(api.community.getFollowers, {});
  const following = useQuery(api.community.getFollowing, {});
  const searchResults = useQuery(api.community.searchUsers, { 
    searchTerm: debouncedSearch 
  });

  if (!currentUser) {
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
      <div className="space-y-8">
        {/* Header */}
        <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-purple)]/20 neon-glow-purple">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-black/40 border-2 border-[var(--neon-purple)] flex items-center justify-center neon-glow-purple">
              <Users className="w-8 h-8 text-[var(--neon-purple)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text-purple tracking-wider uppercase">
                Community
              </h1>
              <p className="text-muted-foreground text-sm uppercase tracking-wide mt-1">
                Connect with other players
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card border-2 border-[var(--neon-cyan)]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">
                    Followers
                  </p>
                  <p className="text-3xl font-bold text-[var(--neon-cyan)]">
                    {currentUser.followerCount ?? 0}
                  </p>
                </div>
                <Users className="w-10 h-10 text-[var(--neon-cyan)]/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-2 border-[var(--neon-magenta)]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">
                    Following
                  </p>
                  <p className="text-3xl font-bold text-[var(--neon-magenta)]">
                    {currentUser.followingCount ?? 0}
                  </p>
                </div>
                <UserPlus className="w-10 h-10 text-[var(--neon-magenta)]/50" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-2 border-[var(--neon-purple)]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">
                    Points
                  </p>
                  <p className="text-3xl font-bold text-[var(--neon-purple)]">
                    {currentUser.totalPoints.toLocaleString()}
                  </p>
                </div>
                <Zap className="w-10 h-10 text-[var(--neon-purple)]/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass-card border-2 border-[var(--neon-cyan)]/20 w-full grid grid-cols-3">
            <TabsTrigger 
              value="discover"
              className="data-[state=active]:bg-[var(--neon-cyan)]/20 data-[state=active]:text-[var(--neon-cyan)] uppercase tracking-wider font-semibold"
            >
              <Search className="w-4 h-4 mr-2" />
              Discover
            </TabsTrigger>
            <TabsTrigger 
              value="followers"
              className="data-[state=active]:bg-[var(--neon-magenta)]/20 data-[state=active]:text-[var(--neon-magenta)] uppercase tracking-wider font-semibold"
            >
              <Users className="w-4 h-4 mr-2" />
              Followers
            </TabsTrigger>
            <TabsTrigger 
              value="following"
              className="data-[state=active]:bg-[var(--neon-purple)]/20 data-[state=active]:text-[var(--neon-purple)] uppercase tracking-wider font-semibold"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Following
            </TabsTrigger>
          </TabsList>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-4">
            <Card className="glass-card border-2 border-[var(--neon-cyan)]/20">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--neon-cyan)] uppercase tracking-wider">
                  Find Players
                </CardTitle>
                <CardDescription className="uppercase tracking-wide">
                  Search by name or username
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass-card border-2 border-[var(--neon-cyan)]/30 pl-10"
                  />
                </div>

                <div className="mt-6 space-y-3">
                  {searchResults === undefined ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                      <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground uppercase tracking-wide">
                        {searchTerm ? "No players found" : "Start searching for players"}
                      </p>
                    </div>
                  ) : (
                    searchResults.map((user) => (
                      <UserCard
                        key={user._id}
                        user={user}
                        currentUserId={currentUser._id}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Followers Tab */}
          <TabsContent value="followers" className="space-y-4">
            <Card className="glass-card border-2 border-[var(--neon-magenta)]/20">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--neon-magenta)] uppercase tracking-wider">
                  Your Followers
                </CardTitle>
                <CardDescription className="uppercase tracking-wide">
                  Players following you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {followers === undefined ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : followers.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground uppercase tracking-wide">
                        No followers yet
                      </p>
                    </div>
                  ) : (
                    followers.map((user) => (
                      <UserCard
                        key={user._id}
                        user={user}
                        currentUserId={currentUser._id}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following" className="space-y-4">
            <Card className="glass-card border-2 border-[var(--neon-purple)]/20">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--neon-purple)] uppercase tracking-wider">
                  Following
                </CardTitle>
                <CardDescription className="uppercase tracking-wide">
                  Players you follow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {following === undefined ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : following.length === 0 ? (
                    <div className="text-center py-12">
                      <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground uppercase tracking-wide">
                        Not following anyone yet
                      </p>
                    </div>
                  ) : (
                    following.map((user) => (
                      <UserCard
                        key={user._id}
                        user={user}
                        currentUserId={currentUser._id}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

interface UserCardProps {
  user: {
    _id: Id<"users">;
    name?: string;
    username?: string;
    avatar?: string;
    totalPoints: number;
    level: number;
    followerCount?: number;
  };
  currentUserId: Id<"users">;
}

function UserCard({ user, currentUserId }: UserCardProps) {
  const isFollowing = useQuery(api.community.isFollowing, { userId: user._id });
  const followUser = useMutation(api.community.followUser);
  const unfollowUser = useMutation(api.community.unfollowUser);
  const [isLoading, setIsLoading] = useState(false);

  const isSelf = user._id === currentUserId;

  const handleFollowToggle = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser({ userId: user._id });
        toast.success("Unfollowed successfully");
      } else {
        await followUser({ userId: user._id });
        toast.success("Followed successfully");
      }
    } catch (error) {
      console.error("Follow error:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 border-2 border-[var(--neon-cyan)]/20 hover:border-[var(--neon-cyan)]/40 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 border-2 border-[var(--neon-cyan)]">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-black/40 text-[var(--neon-cyan)]">
              {(user.username || user.name || "?").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[var(--neon-cyan)] uppercase tracking-wide">
                {user.username || user.name || "Unknown"}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--neon-purple)]/20 text-[var(--neon-purple)] border border-[var(--neon-purple)]/30 uppercase tracking-wider font-semibold">
                LVL {user.level}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground uppercase tracking-wider mt-1">
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                {user.totalPoints.toLocaleString()} pts
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {user.followerCount ?? 0} followers
              </span>
            </div>
          </div>
        </div>

        {!isSelf && (
          <Button
            onClick={handleFollowToggle}
            disabled={isLoading || isFollowing === undefined}
            size="sm"
            className={
              isFollowing
                ? "glass-card border-2 border-destructive/50 text-destructive hover:bg-destructive/10 font-semibold uppercase tracking-wider"
                : "glass-card border-2 border-[var(--neon-magenta)] text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/10 hover:neon-glow-magenta font-semibold uppercase tracking-wider"
            }
          >
            {isFollowing ? (
              <>
                <UserMinus className="w-4 h-4 mr-2" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Follow
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
