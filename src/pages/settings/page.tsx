import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/pages/dashboard/_components/dashboard-layout.tsx";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { AlertCircle, Trash2, Shield, Bell, User, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";
import { useAuth } from "@/hooks/use-auth.ts";

function SettingsContent() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const deleteAccount = useMutation(api.users.deleteAccount);
  const updateNotificationPrefs = useMutation(api.users.updateNotificationPreferences);
  const { signoutRedirect } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Default notification preferences to true if not set
  const notificationPrefs = currentUser?.notificationPreferences ?? {
    quests: true,
    rewards: true,
    social: true,
    messages: true,
  };

  const [localPrefs, setLocalPrefs] = useState(notificationPrefs);

  const handleTogglePreference = async (type: 'quests' | 'rewards' | 'social' | 'messages', value: boolean) => {
    const newPrefs = { ...localPrefs, [type]: value };
    setLocalPrefs(newPrefs);
    
    try {
      await updateNotificationPrefs(newPrefs);
      toast.success("Notification preferences updated");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update preferences");
      // Revert on error
      setLocalPrefs(localPrefs);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount({});
      toast.success("Account deleted successfully");
      // Sign out and redirect to home
      setTimeout(() => {
        signoutRedirect();
      }, 1000);
    } catch (error) {
      console.error("Account deletion error:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold gradient-text-cyber tracking-wider uppercase">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Information */}
      <Card className="glass-card neon-border-cyan">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-[var(--neon-cyan)] uppercase tracking-wider">
            <User className="w-6 h-6" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your basic account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Name
            </Label>
            <div className="glass-card p-4 border border-[var(--neon-cyan)]/30">
              <p className="text-foreground font-medium">
                {currentUser.name || "Not specified"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <div className="glass-card p-4 border border-[var(--neon-cyan)]/30 flex items-center gap-3">
              <Mail className="w-5 h-5 text-[var(--neon-cyan)]" />
              <p className="text-foreground font-medium">
                {currentUser.email || "Not specified"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Username
            </Label>
            <div className="glass-card p-4 border border-[var(--neon-cyan)]/30">
              <p className="text-foreground font-medium">
                {currentUser.username || "Not specified"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Use the profile page to change your username
            </p>
          </div>

          <Button
            onClick={() => navigate("/profile")}
            className="glass-card neon-border-magenta text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/10 hover:neon-glow-magenta font-semibold uppercase tracking-wider"
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="glass-card neon-border-purple">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-[var(--neon-purple)] uppercase tracking-wider">
            <Shield className="w-6 h-6" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Profile visibility and privacy preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 glass-card border border-[var(--neon-purple)]/30">
            <div className="space-y-1">
              <p className="font-semibold text-foreground uppercase tracking-wide">
                Profile Visibility
              </p>
              <p className="text-sm text-muted-foreground">
                Your profile is visible to all users
              </p>
            </div>
            <div className="text-sm text-[var(--neon-cyan)] font-semibold">
              Public
            </div>
          </div>

          <div className="flex items-center justify-between p-4 glass-card border border-[var(--neon-purple)]/30">
            <div className="space-y-1">
              <p className="font-semibold text-foreground uppercase tracking-wide">
                Steam Profile
              </p>
              <p className="text-sm text-muted-foreground">
                Your Steam profile is displayed on dashboard
              </p>
            </div>
            <div className="text-sm text-[var(--neon-cyan)] font-semibold">
              {currentUser.steamId ? "Connected" : "Not Connected"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="glass-card neon-border-cyan">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-[var(--neon-cyan)] uppercase tracking-wider">
            <Bell className="w-6 h-6" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage your notification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 glass-card border border-[var(--neon-cyan)]/30">
            <div className="space-y-1 flex-1">
              <p className="font-semibold text-foreground uppercase tracking-wide">
                Quest Notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Get notified about new daily quests and completions
              </p>
            </div>
            <Switch
              checked={localPrefs.quests}
              onCheckedChange={(checked) => handleTogglePreference('quests', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card border border-[var(--neon-cyan)]/30">
            <div className="space-y-1 flex-1">
              <p className="font-semibold text-foreground uppercase tracking-wide">
                Reward Notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Get notified about reward status updates
              </p>
            </div>
            <Switch
              checked={localPrefs.rewards}
              onCheckedChange={(checked) => handleTogglePreference('rewards', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card border border-[var(--neon-cyan)]/30">
            <div className="space-y-1 flex-1">
              <p className="font-semibold text-foreground uppercase tracking-wide">
                Social Notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Get notified about new followers and comments
              </p>
            </div>
            <Switch
              checked={localPrefs.social}
              onCheckedChange={(checked) => handleTogglePreference('social', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 glass-card border border-[var(--neon-cyan)]/30">
            <div className="space-y-1 flex-1">
              <p className="font-semibold text-foreground uppercase tracking-wide">
                Message Notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Get notified about new messages
              </p>
            </div>
            <Switch
              checked={localPrefs.messages}
              onCheckedChange={(checked) => handleTogglePreference('messages', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="glass-card border-2 border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-destructive uppercase tracking-wider">
            <AlertCircle className="w-6 h-6" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 glass-card border border-destructive/30 space-y-4">
            <div className="space-y-2">
              <p className="font-semibold text-destructive uppercase tracking-wide">
                Delete Account
              </p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all your data. This action cannot be undone.
              </p>
            </div>

            <Separator className="bg-destructive/20" />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full font-semibold uppercase tracking-wider"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Permanently Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-card border-2 border-destructive/50">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl text-destructive uppercase tracking-wider">
                    Are you sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-base">
                    This action cannot be undone. Your account and all of the following data will be permanently deleted:
                    <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                      <li>Steam profile and game data</li>
                      <li>Quest history and progress</li>
                      <li>Trading cards and NFTs</li>
                      <li>Points history and leaderboard ranking</li>
                      <li>Wallet connections</li>
                      <li>Followers and following</li>
                      <li>Profile comments</li>
                      <li>Daily check-in streak</li>
                      <li>Reward purchases</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="glass-card neon-border-cyan text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 font-semibold uppercase tracking-wider">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold uppercase tracking-wider"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  return (
    <DashboardLayout>
      <Authenticated>
        <SettingsContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Shield className="w-16 h-16 text-[var(--neon-cyan)] neon-glow-cyan" />
          <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider">
            Sign In Required
          </h2>
          <p className="text-muted-foreground">
            Please sign in to view your settings
          </p>
        </div>
      </Unauthenticated>
      <AuthLoading>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AuthLoading>
    </DashboardLayout>
  );
}
