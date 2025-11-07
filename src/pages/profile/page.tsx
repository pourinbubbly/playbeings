import { useState } from "react";
import React from "react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { DashboardLayout } from "../dashboard/_components/dashboard-layout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { User, Image, ImageIcon, Save, Upload, MessageSquare, Loader2, Send, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { UnauthenticatedPage } from "@/components/ui/unauthenticated-page.tsx";
import { getConnectedWallet, createProfileCommentTransaction } from "@/lib/wallet.ts";

export default function Profile() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen flex items-center justify-center">
          <Skeleton className="h-20 w-64" />
        </div>
      </AuthLoading>
      <Authenticated>
        <ProfileContent />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedPage />
      </Unauthenticated>
    </>
  );
}

function ProfileContent() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const updateProfile = useMutation(api.users.updateProfile);
  
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [twitter, setTwitter] = useState("");
  const [discord, setDiscord] = useState("");
  const [twitch, setTwitch] = useState("");
  const [youtube, setYoutube] = useState("");
  const [saving, setSaving] = useState(false);

  // Initialize form with current user data
  React.useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "");
      setBio(currentUser.bio || "");
      setAvatar(currentUser.avatar || "");
      setBanner(currentUser.banner || "");
      setTwitter(currentUser.socialLinks?.twitter || "");
      setDiscord(currentUser.socialLinks?.discord || "");
      setTwitch(currentUser.socialLinks?.twitch || "");
      setYoutube(currentUser.socialLinks?.youtube || "");
    }
  }, [currentUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        username: username || undefined,
        bio: bio || undefined,
        avatar: avatar || undefined,
        banner: banner || undefined,
        socialLinks: {
          twitter: twitter || undefined,
          discord: discord || undefined,
          twitch: twitch || undefined,
          youtube: youtube || undefined,
        },
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to update profile", {
          description: error.message,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (currentUser === undefined) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card p-8 rounded-sm border-2 border-[var(--neon-cyan)]/20 neon-glow-cyan">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-black/40 border-2 border-[var(--neon-cyan)] flex items-center justify-center neon-glow-cyan">
              <User className="w-8 h-8 text-[var(--neon-cyan)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text-cyber tracking-wider uppercase">
                Edit Profile
              </h1>
              <p className="text-muted-foreground text-sm uppercase tracking-wide mt-1">
                Customize your gaming profile
              </p>
            </div>
          </div>
        </div>

        {/* Profile Preview */}
        <Card className="glass-card border-2 border-[var(--neon-purple)]/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold gradient-text-purple uppercase tracking-wider">
              Profile Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Banner */}
            <div className="aspect-[4/1] bg-black/40 rounded border-2 border-[var(--neon-cyan)]/20 overflow-hidden relative">
              {banner ? (
                <img src={banner} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="w-12 h-12 opacity-50" />
                </div>
              )}
            </div>

            {/* Avatar & Username */}
            <div className="flex items-center gap-4 -mt-12 relative z-10 px-4">
              <div className="w-24 h-24 rounded-full bg-black border-4 border-[var(--neon-cyan)] overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-[var(--neon-cyan)]" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--neon-cyan)]">
                  {username || currentUser?.name || "No username"}
                </h3>
                <p className="text-sm text-muted-foreground">{bio || "No bio"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="glass-card border-2 border-[var(--neon-cyan)]/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold gradient-text-cyber uppercase tracking-wider">
              Profile Information
            </CardTitle>
            <CardDescription className="uppercase tracking-wide">
              Update your profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[var(--neon-cyan)] font-semibold uppercase tracking-wide">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="glass-card border-2 border-[var(--neon-purple)]/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-[var(--neon-cyan)] font-semibold uppercase tracking-wide">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="glass-card border-2 border-[var(--neon-purple)]/30 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-[var(--neon-cyan)] font-semibold uppercase tracking-wide">
                Avatar URL
              </Label>
              <Input
                id="avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://..."
                className="glass-card border-2 border-[var(--neon-purple)]/30"
              />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Upload images to Files & Media tab, then paste URL here
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner" className="text-[var(--neon-cyan)] font-semibold uppercase tracking-wide">
                Banner URL
              </Label>
              <Input
                id="banner"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="https://..."
                className="glass-card border-2 border-[var(--neon-purple)]/30"
              />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Upload images to Files & Media tab, then paste URL here
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="glass-card border-2 border-[var(--neon-magenta)]/20">
          <CardHeader>
            <CardTitle className="text-xl font-bold gradient-text-purple uppercase tracking-wider">
              Social Links
            </CardTitle>
            <CardDescription className="uppercase tracking-wide">
              Connect your social media accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-[var(--neon-cyan)] font-semibold uppercase tracking-wide">
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@username"
                  className="glass-card border-2 border-[var(--neon-purple)]/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discord" className="text-[var(--neon-cyan)] font-semibold uppercase tracking-wide">
                  Discord
                </Label>
                <Input
                  id="discord"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  placeholder="username#0000"
                  className="glass-card border-2 border-[var(--neon-purple)]/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitch" className="text-[var(--neon-cyan)] font-semibold uppercase tracking-wide">
                  Twitch
                </Label>
                <Input
                  id="twitch"
                  value={twitch}
                  onChange={(e) => setTwitch(e.target.value)}
                  placeholder="username"
                  className="glass-card border-2 border-[var(--neon-purple)]/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube" className="text-[var(--neon-cyan)] font-semibold uppercase tracking-wide">
                  YouTube
                </Label>
                <Input
                  id="youtube"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="channel name"
                  className="glass-card border-2 border-[var(--neon-purple)]/30"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="glass-card border-2 border-[var(--neon-magenta)] hover:neon-glow-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 font-bold uppercase tracking-wider px-8"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>

        {/* Profile Comments Section */}
        {currentUser && <ProfileCommentsSection currentUser={currentUser} />}
      </div>
    </DashboardLayout>
  );
}

interface ProfileCommentsSectionProps {
  currentUser: Doc<"users">;
}

function ProfileCommentsSection({ currentUser }: ProfileCommentsSectionProps) {
  const comments = useQuery(api.community.getProfileComments, { userId: currentUser._id });
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
      // Show transaction prompt
      toast.info("Approve transaction in Backpack", {
        description: "Confirm the comment transaction to continue",
      });
      
      // Perform CARV SVM transaction
      const { signature, explorerUrl } = await createProfileCommentTransaction(
        currentUser.username || currentUser.name || "User",
        commentText
      );
      
      console.log("Comment transaction confirmed:", signature);
      
      // Save comment to database
      await addCommentMutation({
        profileUserId: currentUser._id,
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
          Leave a comment on your profile (requires CARV SVM transaction)
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
                  
                  {comment.authorId === currentUser._id && (
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
