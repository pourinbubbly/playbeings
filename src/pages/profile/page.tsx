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
import { User, Image, ImageIcon, Save, Upload, MessageSquare, Loader2, Send, Trash2, ExternalLink, Crop, Crown } from "lucide-react";
import { toast } from "sonner";
import { CarvBadge } from "@/components/carv-badge.tsx";
import { UnauthenticatedPage } from "@/components/ui/unauthenticated-page.tsx";
import { createProfileCommentTransaction, deleteProfileCommentTransaction } from "@/lib/wallet.ts";
import { ImageCropDialog } from "@/components/ui/image-crop-dialog.tsx";
import { checkWalletConnection } from "@/lib/wallet-check.ts";

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
  const passInfo = useQuery(api.premiumPass.getPremiumPassInfo, {});
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [twitter, setTwitter] = useState("");
  const [discord, setDiscord] = useState("");
  const [twitch, setTwitch] = useState("");
  const [youtube, setYoutube] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [cropType, setCropType] = useState<"avatar" | "banner">("avatar");

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

  const getStorageUrl = useMutation(api.users.getStorageUrl);

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Open crop dialog
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageUrl(reader.result as string);
      setCropType("avatar");
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Open crop dialog
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageUrl(reader.result as string);
      setCropType("banner");
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (cropType === "avatar") {
      setUploadingAvatar(true);
    } else {
      setUploadingBanner(true);
    }

    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "image/png" },
        body: croppedBlob,
      });
      const { storageId } = await result.json();
      const imageUrl = await getStorageUrl({ storageId });

      if (cropType === "avatar") {
        setAvatar(imageUrl || "");
        toast.success("Avatar cropped and uploaded!");
      } else {
        setBanner(imageUrl || "");
        toast.success("Banner cropped and uploaded!");
      }
    } catch (error) {
      toast.error(`Failed to upload ${cropType}`);
      console.error(error);
    } finally {
      if (cropType === "avatar") {
        setUploadingAvatar(false);
      } else {
        setUploadingBanner(false);
      }
    }
  };

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
        <div className="glass-card p-6 md:p-8 rounded-lg border border-[var(--neon-cyan)]/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded bg-[var(--neon-cyan)]/10 flex items-center justify-center">
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
        <Card className="glass-card border border-[var(--neon-purple)]/20">
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-[var(--neon-cyan)]">
                    {username || currentUser?.name || "No username"}
                  </h3>
                  {currentUser?.carvId && (
                    <CarvBadge 
                      carvId={currentUser.carvId}
                      reputationScore={currentUser.carvReputationScore}
                      size="sm"
                    />
                  )}
                  {passInfo && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500 text-yellow-500 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider neon-glow-yellow">
                      <Crown className="w-3 h-3" />
                      <span>Pass Active</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{bio || "No bio"}</p>
                
                {/* Social Links Preview */}
                {(twitter || discord || twitch || youtube) && (
                  <div className="flex items-center gap-2 mt-2">
                    {twitter && (
                      <div className="text-[var(--neon-cyan)]" title="Twitter">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </div>
                    )}
                    {discord && (
                      <div className="text-[var(--neon-purple)]" title="Discord">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </div>
                    )}
                    {twitch && (
                      <div className="text-[var(--neon-magenta)]" title="Twitch">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                        </svg>
                      </div>
                    )}
                    {youtube && (
                      <div className="text-red-500" title="YouTube">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="glass-card border border-[var(--neon-cyan)]/20">
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
                className="glass-card border border-[var(--neon-purple)]/20"
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
                className="glass-card border border-[var(--neon-purple)]/20 min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar" className="text-[var(--neon-cyan)] font-semibold uppercase tracking-wide">
                Avatar
              </Label>
              <div className="flex gap-2">
                <Input
                  id="avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="glass-card border border-[var(--neon-purple)]/20 flex-1"
                />
                <Button
                  onClick={() => document.getElementById("avatar-upload")?.click()}
                  disabled={uploadingAvatar}
                  className="bg-black/20 border border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20"
                  title="Upload and crop avatar"
                >
                  {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crop className="w-4 h-4" />}
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadAvatar}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Upload from PC (with cropping) or paste URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner" className="text-[var(--neon-cyan)] font-semibold uppercase tracking-wide">
                Banner
              </Label>
              <div className="flex gap-2">
                <Input
                  id="banner"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                  placeholder="https://..."
                  className="glass-card border border-[var(--neon-purple)]/20 flex-1"
                />
                <Button
                  onClick={() => document.getElementById("banner-upload")?.click()}
                  disabled={uploadingBanner}
                  className="bg-black/20 border border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/20"
                  title="Upload and crop banner"
                >
                  {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crop className="w-4 h-4" />}
                </Button>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadBanner}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Upload from PC (with cropping) or paste URL
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Image Crop Dialog */}
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageUrl={cropImageUrl}
          onCropComplete={handleCropComplete}
          aspectRatio={cropType === "avatar" ? 1 : 4}
          circularCrop={cropType === "avatar"}
        />

        {/* Social Links */}
        <Card className="glass-card border border-[var(--neon-magenta)]/20">
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
                  className="glass-card border border-[var(--neon-purple)]/20"
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
                  className="glass-card border border-[var(--neon-purple)]/20"
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
                  className="glass-card border border-[var(--neon-purple)]/20"
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
                  className="glass-card border border-[var(--neon-purple)]/20"
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
            className="bg-[var(--neon-magenta)]/10 border border-[var(--neon-magenta)] text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/20 font-bold uppercase tracking-wider px-8"
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
    
    if (!checkWalletConnection()) {
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
    if (!checkWalletConnection()) {
      return;
    }

    try {
      toast.info("Approve transaction in Backpack", {
        description: "Confirm the deletion transaction to continue",
      });

      const { signature, explorerUrl } = await deleteProfileCommentTransaction(
        commentId,
        currentUser.username || currentUser.name || "User"
      );

      toast.success("Transaction submitted!", {
        description: "Deleting your comment...",
      });

      await deleteCommentMutation({ commentId, txHash: signature });
      
      toast.success("Comment deleted successfully!", {
        description: "View on CARV Explorer",
        action: {
          label: "View TX",
          onClick: () => window.open(explorerUrl, "_blank"),
        },
      });
    } catch (error) {
      console.error("Delete comment error:", error);
      if (error instanceof Error) {
        if (error.message.includes("Plugin Closed") || error.message.includes("User rejected")) {
          toast.error("Transaction cancelled");
        } else {
          toast.error("Failed to delete comment", {
            description: error.message,
          });
        }
      } else {
        toast.error("Failed to delete comment");
      }
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
