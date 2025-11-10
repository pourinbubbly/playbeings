import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel.d.ts";

// Get or create a conversation between two users
export const getOrCreateConversation = mutation({
  args: {
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    // Check if blocked
    const isBlocked = await ctx.db
      .query("blocks")
      .withIndex("by_blocker_blocked", (q) =>
        q.eq("blockerId", user._id).eq("blockedId", args.otherUserId)
      )
      .first();

    const isBlockedBy = await ctx.db
      .query("blocks")
      .withIndex("by_blocker_blocked", (q) =>
        q.eq("blockerId", args.otherUserId).eq("blockedId", user._id)
      )
      .first();

    if (isBlocked || isBlockedBy) {
      throw new ConvexError({
        message: "Cannot message this user",
        code: "FORBIDDEN",
      });
    }

    // Find existing conversation (either direction)
    const [participant1, participant2] =
      user._id < args.otherUserId
        ? [user._id, args.otherUserId]
        : [args.otherUserId, user._id];

    const existingConv = await ctx.db
      .query("conversations")
      .withIndex("by_participants", (q) =>
        q.eq("participant1", participant1).eq("participant2", participant2)
      )
      .first();

    if (existingConv) {
      // If conversation was hidden, unhide it
      try {
        const hidden = await ctx.db
          .query("hiddenConversations")
          .withIndex("by_user_conversation", (q) =>
            q.eq("userId", user._id).eq("conversationId", existingConv._id)
          )
          .first();
        
        if (hidden) {
          await ctx.db.delete(hidden._id);
        }
      } catch (error) {
        console.error("Error unhiding conversation:", error);
        // Continue even if unhide fails
      }
      
      return existingConv._id;
    }

    // Create new conversation
    const convId = await ctx.db.insert("conversations", {
      participant1,
      participant2,
      unreadCount1: 0,
      unreadCount2: 0,
    });

    return convId;
  },
});

// Get conversations for current user
export const getMyConversations = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return [];
    }

    // Get all conversations where user is participant
    const convs1 = await ctx.db
      .query("conversations")
      .withIndex("by_participant1", (q) => q.eq("participant1", user._id))
      .collect();

    const convs2 = await ctx.db
      .query("conversations")
      .withIndex("by_participant2", (q) => q.eq("participant2", user._id))
      .collect();

    const allConvs = [...convs1, ...convs2];

    // Get hidden conversations
    const hiddenConvs = await ctx.db
      .query("hiddenConversations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const hiddenConvIds = new Set(hiddenConvs.map(h => h.conversationId));

    // Get other user info for each conversation
    const convsWithUsers = await Promise.all(
      allConvs.map(async (conv) => {
        // Skip if hidden
        if (hiddenConvIds.has(conv._id)) {
          return null;
        }

        const otherUserId =
          conv.participant1 === user._id ? conv.participant2 : conv.participant1;
        const otherUser = await ctx.db.get(otherUserId);
        const unreadCount =
          conv.participant1 === user._id ? conv.unreadCount1 : conv.unreadCount2;

        return {
          _id: conv._id,
          otherUser: otherUser
            ? {
                _id: otherUser._id,
                username: otherUser.username || otherUser.name || "Unknown User",
                avatar: otherUser.avatar,
              }
            : null,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount,
        };
      })
    );

    // Sort by last message time (filter nulls with proper type)
    type ValidConv = Exclude<typeof convsWithUsers[number], null> & {
      otherUser: NonNullable<Exclude<typeof convsWithUsers[number], null>['otherUser']>;
    };
    
    const validConvs = convsWithUsers.filter(
      (c): c is ValidConv => c !== null && c.otherUser !== null
    );
    
    return validConvs.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
  },
});

// Get messages in a conversation
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return [];
    }

    // Verify user is part of conversation
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) {
      return [];
    }

    if (conv.participant1 !== user._id && conv.participant2 !== user._id) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();

    // Return messages with storage IDs (frontend will generate URLs)
    return messages;
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    messageType: v.optional(v.string()),
    imageUrl: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) {
      throw new ConvexError({
        message: "Conversation not found",
        code: "NOT_FOUND",
      });
    }

    // Verify user is part of conversation
    if (conv.participant1 !== user._id && conv.participant2 !== user._id) {
      throw new ConvexError({
        message: "Not authorized",
        code: "FORBIDDEN",
      });
    }

    const receiverId =
      conv.participant1 === user._id ? conv.participant2 : conv.participant1;

    // Check if blocked
    const isBlocked = await ctx.db
      .query("blocks")
      .withIndex("by_blocker_blocked", (q) =>
        q.eq("blockerId", user._id).eq("blockedId", receiverId)
      )
      .first();

    const isBlockedBy = await ctx.db
      .query("blocks")
      .withIndex("by_blocker_blocked", (q) =>
        q.eq("blockerId", receiverId).eq("blockedId", user._id)
      )
      .first();

    if (isBlocked || isBlockedBy) {
      throw new ConvexError({
        message: "Cannot message this user",
        code: "FORBIDDEN",
      });
    }

    const now = Date.now();

    // Insert message
    await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: user._id,
      receiverId,
      content: args.content,
      messageType: args.messageType || "text",
      imageUrl: args.imageUrl,
      isRead: false,
      createdAt: now,
    });

    // Update conversation
    const unreadUpdate =
      conv.participant1 === user._id
        ? { unreadCount2: conv.unreadCount2 + 1 }
        : { unreadCount1: conv.unreadCount1 + 1 };

    const lastMsg = args.messageType === "image" ? "📷 Resim" : args.content.substring(0, 100);

    await ctx.db.patch(args.conversationId, {
      lastMessage: lastMsg,
      lastMessageTime: now,
      ...unreadUpdate,
    });

    // Create notification for receiver (if messages notifications enabled)
    const receiver = await ctx.db.get(receiverId);
    if (receiver && receiver.notificationPreferences?.messages !== false) {
      await ctx.db.insert("notifications", {
        userId: receiverId,
        type: "message",
        title: "New Message",
        message: `${user.username || user.name || "Someone"} sent you a message`,
        isRead: false,
        link: `/dashboard`,
        createdAt: now,
      });
    }

    return { success: true };
  },
});

// Mark messages as read
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return;
    }

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) {
      return;
    }

    // Verify user is part of conversation
    if (conv.participant1 !== user._id && conv.participant2 !== user._id) {
      return;
    }

    // Get unread messages for this user
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) =>
        q.and(q.eq(q.field("receiverId"), user._id), q.eq(q.field("isRead"), false))
      )
      .collect();

    // Mark all as read
    await Promise.all(
      messages.map((msg) => ctx.db.patch(msg._id, { isRead: true }))
    );

    // Reset unread count
    const unreadUpdate =
      conv.participant1 === user._id
        ? { unreadCount1: 0 }
        : { unreadCount2: 0 };

    await ctx.db.patch(args.conversationId, unreadUpdate);
  },
});

// Block user
export const blockUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    // Check if already blocked
    const existing = await ctx.db
      .query("blocks")
      .withIndex("by_blocker_blocked", (q) =>
        q.eq("blockerId", user._id).eq("blockedId", args.userId)
      )
      .first();

    if (existing) {
      throw new ConvexError({
        message: "User already blocked",
        code: "CONFLICT",
      });
    }

    await ctx.db.insert("blocks", {
      blockerId: user._id,
      blockedId: args.userId,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// Unblock user
export const unblockUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    const block = await ctx.db
      .query("blocks")
      .withIndex("by_blocker_blocked", (q) =>
        q.eq("blockerId", user._id).eq("blockedId", args.userId)
      )
      .first();

    if (!block) {
      throw new ConvexError({
        message: "User not blocked",
        code: "NOT_FOUND",
      });
    }

    await ctx.db.delete(block._id);

    return { success: true };
  },
});

// Check if user is blocked
export const isBlocked = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return false;
    }

    const block = await ctx.db
      .query("blocks")
      .withIndex("by_blocker_blocked", (q) =>
        q.eq("blockerId", user._id).eq("blockedId", args.userId)
      )
      .first();

    return !!block;
  },
});

// Upload custom sticker (Premium Pass required)
export const uploadCustomSticker = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    // Check if user has active premium pass
    const now = Date.now();
    const premiumPass = await ctx.db
      .query("premiumPasses")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.gt(q.field("expiryDate"), now)
        )
      )
      .first();

    if (!premiumPass) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Premium Pass required to upload custom stickers",
      });
    }

    // Save sticker
    await ctx.db.insert("customStickers", {
      userId: user._id,
      stickerUrl: args.storageId,
      uploadedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get user's custom stickers
export const getCustomStickers = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return [];
    }

    const stickers = await ctx.db
      .query("customStickers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return stickers;
  },
});

// Generate upload URL for stickers
export const generateStickerUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// Generate upload URL for chat images
export const generateImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// Hide a conversation
export const hideConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    // Check if already hidden
    const existing = await ctx.db
      .query("hiddenConversations")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", user._id).eq("conversationId", args.conversationId)
      )
      .first();

    if (existing) {
      return { success: true };
    }

    // Hide conversation
    await ctx.db.insert("hiddenConversations", {
      userId: user._id,
      conversationId: args.conversationId,
      hiddenAt: Date.now(),
    });

    return { success: true };
  },
});

// Unhide a conversation
export const unhideConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        message: "User not logged in",
        code: "UNAUTHENTICATED",
      });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new ConvexError({
        message: "User not found",
        code: "NOT_FOUND",
      });
    }

    // Find hidden record
    const hidden = await ctx.db
      .query("hiddenConversations")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", user._id).eq("conversationId", args.conversationId)
      )
      .first();

    if (hidden) {
      await ctx.db.delete(hidden._id);
    }

    return { success: true };
  },
});

// Get following users for search
export const getFollowingUsers = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return [];
    }

    // Get all follows
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", user._id))
      .collect();

    // Get user details for each follow
    const followingUsers = await Promise.all(
      follows.map(async (follow) => {
        const followedUser = await ctx.db.get(follow.followingId);
        if (!followedUser) return null;
        
        return {
          _id: followedUser._id,
          username: followedUser.username || followedUser.name || "Unknown User",
          avatar: followedUser.avatar,
        };
      })
    );

    return followingUsers.filter((u) => u !== null);
  },
});
