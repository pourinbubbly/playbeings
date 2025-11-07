import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
import { DashboardLayout } from "@/pages/dashboard/_components/dashboard-layout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { 
  User, 
  UserPlus, 
  UserMinus, 
  MessageSquare, 
  Trophy, 
  Zap, 
  Users,
  Gamepad2,
  ExternalLink,
  Loader2,
  Send,
  Trash2,
  Sparkles,
  Shield,
  Flame
} from "lucide-react";
import { toast } from "sonner";
import { UnauthenticatedPage } from "@/components/ui/unauthenticated-page.tsx";
import { getConnectedWallet, createProfileCommentTransaction } from "@/lib/wallet.ts";

export default function UserProfile() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <UserProfileContent />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedPage />
      </Unauthenticated>
    </>
  );
}

function UserProfileContent() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const currentUser = useQuery(api.users.getCurrentUser);
  const targetUser = useQuery(api.users.getUserById, userId ? { userId: userId as Id<"users"> } : "skip");
  const steamProfile = useQuery(api.profiles.getSteamProfile, userId ? { userId: userId as Id<"users"> } : "skip");
  const userGames = useQuery(api.profiles.getUserGames, userId ? { userId: userId as Id<"users"> } : "skip");
  const userNFTs = useQuery(api.nft.getMintedNFTs, {});
  const isFollowing = useQuery(api.community.isFollowing, userId ? { userId: userId as Id<"users"> } : "skip");
  
  const followUser = useMutation(api.community.followUser);
  const unfollowUser = useMutation(api.community.unfollowUser);
  
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (!userId) {
    navigate("/community");
    return null;
  }

  if (!currentUser || !targetUser) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const isSelf = currentUser._id === targetUser._id;

  const handleFollowToggle = async () => {
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser({ userId: targetUser._id });
        toast.success("Unfollowed successfully");
      } else {
        await followUser({ userId: targetUser._id });
        toast.success("Followed successfully");
      }
    } catch (error) {
      console.error("Follow error:", error);
      toast.error("Failed to update follow status");
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="glass-card border-2 border-[var(--neon-purple)]/30 overflow-hidden">
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-[var(--neon-purple)]/20 via-[var(--neon-cyan)]/20 to-[var(--neon-magenta)]/20 relative">
            {targetUser.banner && (
              <img src={targetUser.banner} alt="Banner" className="w-full h-full object-cover" />
            )}
          </div>

          {/* Profile Info */}
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-16 mb-4">
              <div className="flex items-end gap-4">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full border-4 border-black bg-black overflow-hidden">
                  {targetUser.avatar ? (
                    <img src={targetUser.avatar} alt={targetUser.name || "User"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--neon-cyan)]/20">
                      <User className="w-16 h-16 text-[var(--neon-cyan)]" />
                    </div>
                  )}
                </div>

                {/* Name & Stats */}
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-[var(--neon-cyan)] uppercase tracking-wider">
                    {targetUser.username || targetUser.name || "Unknown User"}
                  </h1>
                  {targetUser.bio && (
                    <p className="text-muted-foreground mt-1">{targetUser.bio}</p>
                  )}
                  
                  {/* Social Links */}
                  {targetUser.socialLinks && (
                    <div className="flex items-center gap-3 mt-2">
                      {targetUser.socialLinks.twitter && (
                        <a
                          href={`https://twitter.com/${targetUser.socialLinks.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--neon-cyan)] hover:text-[var(--neon-cyan)]/80 transition-colors"
                          title="Twitter"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                      )}
                      {targetUser.socialLinks.discord && (
                        <a
                          href={`https://discord.com/users/${targetUser.socialLinks.discord}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--neon-purple)] hover:text-[var(--neon-purple)]/80 transition-colors"
                          title="Discord"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                          </svg>
                        </a>
                      )}
                      {targetUser.socialLinks.twitch && (
                        <a
                          href={`https://twitch.tv/${targetUser.socialLinks.twitch}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--neon-magenta)] hover:text-[var(--neon-magenta)]/80 transition-colors"
                          title="Twitch"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                          </svg>
                        </a>
                      )}
                      {targetUser.socialLinks.youtube && (
                        <a
                          href={`https://youtube.com/@${targetUser.socialLinks.youtube}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-500 hover:text-red-400 transition-colors"
                          title="YouTube"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[var(--neon-cyan)]" />
                      <span className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{targetUser.followerCount ?? 0}</span> Followers
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[var(--neon-magenta)]" />
                      <span className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{targetUser.followingCount ?? 0}</span> Following
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[var(--neon-purple)]" />
                      <span className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{targetUser.totalPoints.toLocaleString()}</span> Points
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mb-4">
                {isSelf ? (
                  <Button
                    onClick={() => navigate("/profile")}
                    className="glass-card border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 font-semibold uppercase tracking-wider"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading || isFollowing === undefined}
                    className={
                      isFollowing
                        ? "glass-card border-2 border-destructive text-destructive hover:bg-destructive/10 font-semibold uppercase tracking-wider"
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
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass-card border-2 border-[var(--neon-cyan)]/20 w-full grid grid-cols-4">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-[var(--neon-cyan)]/20 data-[state=active]:text-[var(--neon-cyan)] uppercase tracking-wider font-semibold"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="games"
              className="data-[state=active]:bg-[var(--neon-magenta)]/20 data-[state=active]:text-[var(--neon-magenta)] uppercase tracking-wider font-semibold"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Games
            </TabsTrigger>
            <TabsTrigger 
              value="nfts"
              className="data-[state=active]:bg-[var(--neon-purple)]/20 data-[state=active]:text-[var(--neon-purple)] uppercase tracking-wider font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              NFTs
            </TabsTrigger>
            <TabsTrigger 
              value="comments"
              className="data-[state=active]:bg-[var(--neon-cyan)]/20 data-[state=active]:text-[var(--neon-cyan)] uppercase tracking-wider font-semibold"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass-card border-2 border-[var(--neon-cyan)]/20">
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 text-[var(--neon-cyan)] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[var(--neon-cyan)]">
                    {targetUser.totalPoints.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    Total Points
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-2 border-[var(--neon-magenta)]/20">
                <CardContent className="p-6 text-center">
                  <Flame className="w-8 h-8 text-[var(--neon-magenta)] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[var(--neon-magenta)]">
                    {targetUser.currentStreak ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    Current Streak
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-2 border-[var(--neon-purple)]/20">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-8 h-8 text-[var(--neon-purple)] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[var(--neon-purple)]">
                    LVL {targetUser.level}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    Level
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-2 border-[var(--neon-cyan)]/20">
                <CardContent className="p-6 text-center">
                  <Gamepad2 className="w-8 h-8 text-[var(--neon-cyan)] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[var(--neon-cyan)]">
                    {userGames?.length ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    Games
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Steam Profile */}
            {steamProfile && (
              <Card className="glass-card border-2 border-[var(--neon-cyan)]/20">
                <CardHeader>
                  <CardTitle className="text-xl text-[var(--neon-cyan)] uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    Steam Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img 
                        src={steamProfile.avatarUrl} 
                        alt={steamProfile.personaName}
                        className="w-16 h-16 rounded border-2 border-[var(--neon-cyan)]"
                      />
                      <div>
                        <p className="font-bold text-lg text-foreground">{steamProfile.personaName}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{steamProfile.gameCount} games</span>
                          <span>{Math.floor(steamProfile.totalPlaytime / 60)} hours played</span>
                          <span>{steamProfile.achievementCount} achievements</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(steamProfile.profileUrl, "_blank")}
                      className="text-[var(--neon-cyan)]"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-4">
            <Card className="glass-card border-2 border-[var(--neon-magenta)]/20">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--neon-magenta)] uppercase tracking-wider">
                  Game Library
                </CardTitle>
                <CardDescription className="uppercase tracking-wide">
                  {userGames?.length ?? 0} games owned
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!userGames || userGames.length === 0 ? (
                  <div className="text-center py-12">
                    <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground uppercase tracking-wide">
                      No games found
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userGames.map((game) => (
                      <div key={game._id} className="glass-card border border-[var(--neon-magenta)]/20 overflow-hidden hover:border-[var(--neon-magenta)]/40 transition-all">
                        <img 
                          src={game.imageUrl} 
                          alt={game.name}
                          className="w-full aspect-[616/353] object-cover"
                        />
                        <div className="p-3">
                          <p className="font-semibold text-sm text-foreground truncate">{game.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.floor(game.playtime / 60)}h played
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* NFTs Tab */}
          <TabsContent value="nfts" className="space-y-4">
            <Card className="glass-card border-2 border-[var(--neon-purple)]/20">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--neon-purple)] uppercase tracking-wider">
                  NFT Collection
                </CardTitle>
                <CardDescription className="uppercase tracking-wide">
                  Minted achievement NFTs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground uppercase tracking-wide">
                    NFTs are private and only visible to the owner
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            <ProfileCommentsSection 
              currentUser={currentUser}
              targetUser={targetUser}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

interface ProfileCommentsSectionProps {
  currentUser: Doc<"users">;
  targetUser: Doc<"users">;
}

function ProfileCommentsSection({ currentUser, targetUser }: ProfileCommentsSectionProps) {
  const comments = useQuery(api.community.getProfileComments, { userId: targetUser._id });
  const addCommentMutation = useMutation(api.community.addComment);
  const deleteCommentMutation = useMutation(api.community.deleteComment);
  
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddComment = async () => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    const walletAddress = getConnectedWallet();
    if (!walletAddress) {
      toast.error("Please connect your Backpack wallet first");
      return;
    }
    
    setIsSubmitting(true);
    try {
      toast.info("Approve transaction in Backpack", {
        description: "Confirm the comment transaction to continue",
      });
      
      const { signature, explorerUrl } = await createProfileCommentTransaction(
        targetUser.username || targetUser.name || "User",
        commentText
      );
      
      await addCommentMutation({
        profileUserId: targetUser._id,
        content: commentText,
        txHash: signature,
      });
      
      toast.success("Comment posted successfully!", {
        description: "View transaction",
        action: {
          label: "View TX",
          onClick: () => window.open(explorerUrl, "_blank"),
        },
      });
      
      setCommentText("");
    } catch (error) {
      console.error("Comment submission error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("Plugin Closed")) {
          toast.error("Transaction cancelled");
        } else {
          toast.error("Failed to post comment", {
            description: error.message,
          });
        }
      } else {
        toast.error("Failed to post comment");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteComment = async (commentId: Id<"profileComments">) => {
    try {
      await deleteCommentMutation({ commentId });
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Delete comment error:", error);
      toast.error("Failed to delete comment");
    }
  };
  
  return (
    <Card className="glass-card border-2 border-[var(--neon-cyan)]/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold gradient-text-cyber uppercase tracking-wider flex items-center gap-3">
          <MessageSquare className="w-6 h-6" />
          Profile Comments
        </CardTitle>
        <CardDescription className="uppercase tracking-wide">
          Leave a comment (requires CARV SVM transaction)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Input */}
        <div className="space-y-3">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your comment..."
            className="glass-card border-2 border-[var(--neon-purple)]/30 min-h-[100px]"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={isSubmitting || !commentText.trim()}
              className="glass-card border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20 hover:neon-glow-cyan font-bold uppercase tracking-wider"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Comments List */}
        <div className="space-y-4">
          {comments === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground uppercase tracking-wide">
                No comments yet
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="glass-card p-4 border border-[var(--neon-purple)]/20 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black border-2 border-[var(--neon-cyan)] overflow-hidden flex-shrink-0">
                      {comment.author.avatar ? (
                        <img 
                          src={comment.author.avatar} 
                          alt={comment.author.name || "User"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-5 h-5 text-[var(--neon-cyan)]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--neon-cyan)]">
                        {comment.author.username || comment.author.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  {(comment.authorId === currentUser._id || targetUser._id === currentUser._id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <p className="text-foreground pl-13">{comment.content}</p>
                
                {comment.txHash && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[var(--neon-purple)]/10">
                    <ExternalLink className="w-3 h-3 text-[var(--neon-cyan)]" />
                    <a
                      href={`http://explorer.testnet.carv.io/tx/${comment.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[var(--neon-cyan)] hover:underline uppercase tracking-wide"
                    >
                      View on CARV Explorer
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
