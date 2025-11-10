import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated } from "convex/react";
import { MessageCircle, X, Send, Minimize2, User, Smile, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<Id<"conversations"> | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const conversations = useQuery(api.messages.getMyConversations, {});
  const messages = useQuery(
    api.messages.getMessages,
    selectedConvId ? { conversationId: selectedConvId } : "skip"
  );
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  const generateImageUploadUrl = useMutation(api.messages.generateImageUploadUrl);

  // Check if user is at bottom of scroll
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShouldAutoScroll(isAtBottom);
    }
  };

  // Auto-scroll to bottom when messages change (only if user is at bottom)
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldAutoScroll]);

  // Scroll to bottom when conversation changes
  useEffect(() => {
    if (selectedConvId && messagesEndRef.current) {
      setShouldAutoScroll(true);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 100);
    }
  }, [selectedConvId]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConvId && isOpen) {
      markAsRead({ conversationId: selectedConvId });
    }
  }, [selectedConvId, isOpen, markAsRead]);

  // Reset state when closing
  useEffect(() => {
    if (!isOpen) {
      setShowEmojiPicker(false);
      setMessageInput("");
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConvId) return;

    const content = messageInput;
    setMessageInput("");
    setShowEmojiPicker(false);

    try {
      await sendMessage({
        conversationId: selectedConvId,
        content,
        messageType: "text",
      });
    } catch (error) {
      toast.error("Mesaj gönderilemedi");
      setMessageInput(content); // Restore message on error
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConvId) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Dosya çok büyük", {
        description: "Maksimum 5MB boyutunda resim yükleyebilirsiniz",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Geçersiz dosya tipi", {
        description: "Sadece resim dosyaları yükleyebilirsiniz",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      // Generate upload URL
      const uploadUrl = await generateImageUploadUrl({});

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

      // Send image message
      await sendMessage({
        conversationId: selectedConvId,
        content: "📷 Image",
        messageType: "image",
        imageUrl: storageId,
      });

      toast.success("Resim gönderildi!");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Resim gönderilemedi");
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
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
              key="chat-widget"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-4 w-80 glass-card border-2 border-[var(--neon-cyan)]/30 rounded-sm overflow-hidden flex flex-col"
              style={{ height: "600px" }}
            >
              {/* Header */}
              <div className="p-4 border-b-2 border-[var(--neon-cyan)]/20 bg-black/40 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[var(--neon-cyan)]" />
                  <span className="font-bold text-[var(--neon-cyan)] uppercase tracking-wide text-sm">
                    {selectedConv ? selectedConv.otherUser?.username : "Messages"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedConv && (
                    <button
                      onClick={() => {
                        setSelectedConvId(null);
                        setMessageInput("");
                        setShowEmojiPicker(false);
                      }}
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
                <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                  <div className="p-2 space-y-1">
                    {conversations && conversations.length === 0 && (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        Henüz konuşma yok
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
                </div>
              ) : (
                // Message View
                <div className="flex-1 flex flex-col min-h-0">
                  <div 
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4 scroll-smooth"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    <div className="space-y-3">
                      {!messages || messages.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                          Henüz mesaj yok
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isSender = msg.senderId === selectedConv.otherUser?._id ? false : true;
                          const isImageMessage = msg.messageType === "image" && msg.imageUrl;
                          return (
                            <div
                              key={msg._id}
                              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`${isImageMessage ? "max-w-[90%]" : "max-w-[75%]"} p-2 rounded-lg ${
                                  isSender
                                    ? "bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-white"
                                    : "glass-card border border-[var(--neon-purple)]/20"
                                }`}
                              >
                                {isImageMessage ? (
                                  <div className="space-y-2">
                                    <img
                                      src={`${import.meta.env.VITE_CONVEX_URL}/api/storage/${msg.imageUrl}`}
                                      alt="Shared"
                                      className="rounded w-full h-auto object-contain cursor-pointer"
                                      style={{ maxHeight: "300px" }}
                                      onClick={() => window.open(`${import.meta.env.VITE_CONVEX_URL}/api/storage/${msg.imageUrl}`, "_blank")}
                                    />
                                    <p className="text-xs opacity-70 px-1">
                                      {new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm break-words px-1">{msg.content}</p>
                                    <p className="text-xs mt-1 opacity-70 px-1">
                                      {new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t-2 border-[var(--neon-cyan)]/20 bg-black/40 space-y-2 flex-shrink-0">
                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="relative mb-2">
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          width="100%"
                          height={300}
                        />
                      </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      {/* Emoji Button */}
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="glass-card border-2 border-[var(--neon-purple)] text-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/10 flex-shrink-0"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>

                      {/* Image Upload Button */}
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="glass-card border-2 border-[var(--neon-magenta)] text-[var(--neon-magenta)] hover:bg-[var(--neon-magenta)]/10 flex-shrink-0"
                      >
                        {isUploadingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                      </Button>

                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Mesaj yaz..."
                        className="flex-1 glass-card border-[var(--neon-purple)]/30"
                        disabled={isUploadingImage}
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!messageInput.trim() || isUploadingImage}
                        className="glass-card border-2 border-[var(--neon-cyan)] text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 flex-shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
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
