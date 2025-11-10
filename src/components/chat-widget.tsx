import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated } from "convex/react";
import { MessageCircle, X, Send, Minimize2, User, Smile, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<Id<"conversations"> | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploadingSticker, setIsUploadingSticker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const conversations = useQuery(api.messages.getMyConversations, {});
  const messages = useQuery(
    api.messages.getMessages,
    selectedConvId ? { conversationId: selectedConvId } : "skip"
  );
  const hasPremiumPass = useQuery(api.premiumPass.hasActivePremiumPass, {});
  const customStickers = useQuery(api.messages.getCustomStickers, {});
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  const generateStickerUploadUrl = useMutation(api.messages.generateStickerUploadUrl);
  const uploadCustomSticker = useMutation(api.messages.uploadCustomSticker);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedConvId && isOpen) {
      markAsRead({ conversationId: selectedConvId });
    }
  }, [selectedConvId, isOpen, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConvId) return;

    try {
      await sendMessage({
        conversationId: selectedConvId,
        content: messageInput,
      });
      setMessageInput("");
      setShowEmojiPicker(false);
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  const handleStickerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!hasPremiumPass) {
      toast.error("Premium Pass required", {
        description: "Upgrade to Premium Pass to upload custom stickers",
      });
      return;
    }

    setIsUploadingSticker(true);
    try {
      // Generate upload URL
      const uploadUrl = await generateStickerUploadUrl({});

      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();

      // Save sticker to database
      await uploadCustomSticker({ storageId });

      toast.success("Custom sticker uploaded!", {
        description: "You can now use this sticker in your messages",
      });
    } catch (error) {
      console.error("Sticker upload error:", error);
      toast.error("Failed to upload sticker");
    } finally {
      setIsUploadingSticker(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const selectedConv = conversations?.find((c) => c._id === selectedConvId);
  const totalUnread = conversations?.reduce((sum, c) => sum + c.unreadCount, 0) || 0;

  return (
    <Authenticated>
      <div className="fixed bottom-4 left-4 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "600px" }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              className="mb-4 w-80 glass-card border-2 border-[var(--neon-cyan)]/30 rounded-sm overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b-2 border-[var(--neon-cyan)]/20 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[var(--neon-cyan)]" />
                  <span className="font-bold text-[var(--neon-cyan)] uppercase tracking-wide text-sm">
                    {selectedConv ? selectedConv.otherUser?.username : "Messages"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedConv && (
                    <button
                      onClick={() => setSelectedConvId(null)}
                      className="text-muted-foreground hover:text-[var(--neon-cyan)] transition-colors"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-[var(--neon-cyan)] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              {!selectedConv ? (
                // Conversation List
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {conversations && conversations.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        No conversations yet
                      </div>
                    )}
                    {conversations?.map((conv) => (
                      <button
                        key={conv._id}
                        onClick={() => setSelectedConvId(conv._id)}
                        className="w-full p-3 glass-card border border-[var(--neon-purple)]/20 rounded hover:border-[var(--neon-cyan)]/40 transition-all flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center flex-shrink-0">
                          {conv.otherUser?.avatar ? (
                            <img
                              src={conv.otherUser.avatar}
                              alt={conv.otherUser.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-foreground text-sm truncate">
                              {conv.otherUser?.username}
                            </span>
                            {conv.unreadCount > 0 && (
                              <span className="bg-[var(--neon-cyan)] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          {conv.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conv.lastMessage}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                // Message View
                <div className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages?.map((msg) => {
                        const isSender = msg.senderId === selectedConv.otherUser?._id ? false : true;
                        return (
                          <div
                            key={msg._id}
                            className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] p-3 rounded-lg ${
                                isSender
                                  ? "bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-white"
                                  : "glass-card border border-[var(--neon-purple)]/20"
                              }`}
                            >
                              <p className="text-sm break-words">{msg.content}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-[var(--neon-cyan)]/20 bg-black/40 space-y-2">
                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="relative">
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          width="100%"
                          height={300}
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      {/* Emoji Button */}
                      <Button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="glass-card border-2 border-[var(--neon-purple)] text-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/10"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>

                      {/* Sticker Upload Button (Premium only) */}
                      {hasPremiumPass && (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleStickerUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingSticker}
                            className="glass-card border-2 border-[var(--neon-magenta)] text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/10"
                          >
                            {isUploadingSticker ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Image className="w-4 h-4" />
                            )}
                          </Button>
                        </>
                      )}

                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 glass-card border-[var(--neon-purple)]/30"
                      />
                      <Button
                        type="submit"
                        disabled={!messageInput.trim()}
                        className="glass-card border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 glass-card border-2 border-[var(--neon-cyan)] rounded-full flex items-center justify-center hover:scale-110 transition-all neon-glow-cyan relative"
        >
          <MessageCircle className="w-6 h-6 text-[var(--neon-cyan)]" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--neon-magenta)] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center neon-glow-magenta">
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </button>
      </div>
    </Authenticated>
  );
}
