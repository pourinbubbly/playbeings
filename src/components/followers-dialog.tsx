import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { Button } from "@/components/ui/button.tsx";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FollowersDialogProps {
  userId: Id<"users">;
  type: "followers" | "following";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FollowersDialog({ userId, type, open, onOpenChange }: FollowersDialogProps) {
  const navigate = useNavigate();
  const followers = useQuery(api.community.getFollowers, type === "followers" ? { userId } : "skip");
  const following = useQuery(api.community.getFollowing, type === "following" ? { userId } : "skip");

  const users = type === "followers" ? followers : following;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-2 border-[var(--neon-purple)]/30 max-w-md p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-[var(--neon-cyan)] uppercase tracking-wider text-base">
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {type === "followers" ? "People who follow this user" : "People this user follows"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[280px] -mx-1 px-1">
          <div className="space-y-2 pr-3">
            {!users || users.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                {type === "followers" ? "No followers yet" : "Not following anyone yet"}
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-2 p-2 glass-card border border-[var(--neon-purple)]/20 rounded hover:border-[var(--neon-cyan)]/40 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username || user.name || "User"}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {user.username || user.name || "Unknown User"}
                    </p>
                    {user.bio && (
                      <p className="text-xs text-muted-foreground truncate">{user.bio}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      navigate(`/user/${user._id}`);
                    }}
                    className="glass-card border border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 flex-shrink-0 h-7 px-3 text-xs"
                  >
                    View
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
