import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel.d.ts";

export const followUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!currentUser) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    // Can't follow yourself
    if (currentUser._id === args.userId) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Cannot follow yourself",
      });
    }

    // Check if already following
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.userId),
      )
      .unique();

    if (existingFollow) {
      throw new ConvexError({
        code: "CONFLICT",
        message: "Already following this user",
      });
    }

    // Create follow relationship
    await ctx.db.insert("follows", {
      followerId: currentUser._id,
      followingId: args.userId,
      createdAt: Date.now(),
    });

    // Update counts
    const currentFollowingCount = currentUser.followingCount ?? 0;
    await ctx.db.patch(currentUser._id, {
      followingCount: currentFollowingCount + 1,
    });

    const targetUser = await ctx.db.get(args.userId);
    if (targetUser) {
      const targetFollowerCount = targetUser.followerCount ?? 0;
      await ctx.db.patch(args.userId, {
        followerCount: targetFollowerCount + 1,
      });
    }

    return { success: true };
  },
});

export const unfollowUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!currentUser) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.userId),
      )
      .unique();

    if (!follow) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Not following this user",
      });
    }

    await ctx.db.delete(follow._id);

    // Update counts
    const currentFollowingCount = currentUser.followingCount ?? 0;
    await ctx.db.patch(currentUser._id, {
      followingCount: Math.max(0, currentFollowingCount - 1),
    });

    const targetUser = await ctx.db.get(args.userId);
    if (targetUser) {
      const targetFollowerCount = targetUser.followerCount ?? 0;
      await ctx.db.patch(args.userId, {
        followerCount: Math.max(0, targetFollowerCount - 1),
      });
    }

    return { success: true };
  },
});

export const getFollowers = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    let targetUserId = args.userId;

    // If no userId provided, get current user
    if (!targetUserId) {
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_token", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier),
        )
        .unique();
      
      if (!currentUser) {
        return [];
      }
      targetUserId = currentUser._id;
    }

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_following", (q) => q.eq("followingId", targetUserId))
      .order("desc")
      .collect();

    const followers = [];
    for (const follow of follows) {
      const user = await ctx.db.get(follow.followerId);
      if (user) {
        followers.push({
          ...user,
          followedAt: follow.createdAt,
        });
      }
    }

    return followers;
  },
});

export const getFollowing = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    let targetUserId = args.userId;

    // If no userId provided, get current user
    if (!targetUserId) {
      const currentUser = await ctx.db
        .query("users")
        .withIndex("by_token", (q) =>
          q.eq("tokenIdentifier", identity.tokenIdentifier),
        )
        .unique();
      
      if (!currentUser) {
        return [];
      }
      targetUserId = currentUser._id;
    }

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", targetUserId))
      .order("desc")
      .collect();

    const following = [];
    for (const follow of follows) {
      const user = await ctx.db.get(follow.followingId);
      if (user) {
        following.push({
          ...user,
          followedAt: follow.createdAt,
        });
      }
    }

    return following;
  },
});

export const isFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!currentUser) {
      return false;
    }

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_follower_following", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.userId),
      )
      .unique();

    return !!follow;
  },
});

export const addComment = mutation({
  args: {
    profileUserId: v.id("users"),
    content: v.string(),
    txHash: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!currentUser) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (args.content.trim().length === 0) {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Comment cannot be empty",
      });
    }

    await ctx.db.insert("profileComments", {
      profileUserId: args.profileUserId,
      authorId: currentUser._id,
      content: args.content,
      txHash: args.txHash,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const getProfileComments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("profileComments")
      .withIndex("by_profile", (q) => q.eq("profileUserId", args.userId))
      .order("desc")
      .take(50);

    const enrichedComments = [];
    for (const comment of comments) {
      const author = await ctx.db.get(comment.authorId);
      if (author) {
        enrichedComments.push({
          ...comment,
          author: {
            _id: author._id,
            name: author.name,
            username: author.username,
            avatar: author.avatar,
          },
        });
      }
    }

    return enrichedComments;
  },
});

export const deleteComment = mutation({
  args: { 
    commentId: v.id("profileComments"),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "User not logged in",
      });
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!currentUser) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Comment not found",
      });
    }

    // Only author can delete their own comment
    if (comment.authorId !== currentUser._id && comment.profileUserId !== currentUser._id) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Not authorized to delete this comment",
      });
    }

    await ctx.db.delete(args.commentId);
    return { success: true };
  },
});

export const searchUsers = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    if (args.searchTerm.trim().length === 0) {
      return [];
    }

    const allUsers = await ctx.db.query("users").collect();
    
    const searchLower = args.searchTerm.toLowerCase();
    const filteredUsers = allUsers.filter((user) => {
      const nameMatch = user.name?.toLowerCase().includes(searchLower);
      const usernameMatch = user.username?.toLowerCase().includes(searchLower);
      return nameMatch || usernameMatch;
    }).slice(0, 20);

    return filteredUsers;
  },
});
