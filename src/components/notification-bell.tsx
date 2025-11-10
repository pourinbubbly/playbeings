import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

export function NotificationBell() {
  const navigate = useNavigate();
  const notifications = useQuery(api.notifications.getNotifications, {});
  const unreadCount = useQuery(api.notifications.getUnreadCount, {});
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = async (notificationId: string, link?: string) => {
    try {
      await markAsRead({ notificationId: notificationId as Id<"notifications"> });
      if (link) {
        navigate(link);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead({});
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="glass-card neon-border-cyan px-4 py-2.5 h-auto hover:neon-glow-cyan relative"
        >
          <Bell className="w-5 h-5 text-[var(--neon-cyan)]" />
          {(unreadCount ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--neon-magenta)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center neon-glow-magenta animate-pulse">
              {unreadCount! > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="glass-card border-2 border-[var(--neon-cyan)]/30 w-96 p-0"
      >
        <div className="p-4 border-b border-[var(--neon-cyan)]/20 flex items-center justify-between">
          <h3 className="font-bold text-[var(--neon-cyan)] uppercase tracking-wider">
            Notifications
          </h3>
          {(unreadCount ?? 0) > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs text-[var(--neon-purple)] hover:text-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/10"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[500px]">
          {!notifications || notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--neon-cyan)]/10">
              {notifications.map((notification) => (
                <motion.button
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification._id, notification.link)}
                  className={`w-full p-4 text-left transition-all hover:bg-[var(--neon-cyan)]/5 ${
                    !notification.isRead ? "bg-[var(--neon-cyan)]/10" : ""
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-[var(--neon-cyan)] uppercase tracking-wide">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[var(--neon-magenta)] neon-glow-magenta"></span>
                        )}
                      </div>
                      <p className="text-sm text-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
