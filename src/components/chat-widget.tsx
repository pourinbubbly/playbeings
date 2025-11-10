import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated } from "convex/react";
import { MessageCircle, X, Send, Minimize2, User, Smile, Image as ImageIcon, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel.d.ts";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { convexUrl } from "@/lib/convex.ts";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<Id<"conversations"> | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const conversations = useQuery(api.messages.getMyConversations, {});
  const followingUsers = useQuery(api.messages.getFollowingUsers, {});
  const messages = useQuery(
    api.messages.getMessages,
    selectedConvId ? { conversationId: selectedConvId } : "skip"
  );
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  const generateImageUploadUrl = useMutation(api.messages.generateImageUploadUrl);
  const hideConversation = useMutation(api.messages.hideConversation);
  const getOrCreateConversation = useMutation(api.messages.getOrCreateConversation);

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
      setSearchQuery("");
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

      const response = await result.json();
      const storageId = response.storageId;

      if (!storageId) {
        throw new Error("No storage ID returned");
      }

      console.log("Uploaded image storage ID:", storageId);

      // Send image message
      await sendMessage({
        conversationId: selectedConvId,
        content: "📷 Resim",
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
  
  // Check if we have a selected conversation ID but no conversation object yet
  const hasSelectedConv = selectedConvId !== null;
  
  console.log("Selected conv ID:", selectedConvId);
  console.log("Selected conv object:", selectedConv);
  console.log("Has selected conv:", hasSelectedConv);
  console.log("Conversations list length:", conversations?.length);

  // Handle loading timeout for new conversations
  useEffect(() => {
    if (hasSelectedConv && !selectedConv && !loadingTimeout) {
      console.log("Starting loading timeout...");
      const timer = setTimeout(() => {
        console.log("Loading timeout reached");
        setLoadingTimeout(true);
        toast.error("Sohbet yüklenemedi. Lütfen tekrar deneyin.");
        setSelectedConvId(null);
      }, 5000); // 5 seconds timeout (increased for unhide operations)

      return () => clearTimeout(timer);
    } else if (selectedConv && loadingTimeout) {
      // Reset timeout when conversation loads
      setLoadingTimeout(false);
    }
  }, [hasSelectedConv, selectedConv, loadingTimeout]);

  // Filter conversations based on search
  const filteredConversations = conversations?.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const username = conv.otherUser.username?.toLowerCase() || "";
    return username.includes(searchQuery.toLowerCase());
  }) || [];

  // Filter following users based on search (exclude users already in conversations)
  const existingConvUserIds = new Set(
    conversations?.map((c) => c.otherUser._id) || []
  );
  
  const filteredFollowingUsers = followingUsers?.filter((user) => {
    if (!searchQuery.trim()) return false; // Only show when searching
    const username = user.username?.toLowerCase() || "";
    const matchesSearch = username.includes(searchQuery.toLowerCase());
    const notInConversations = !existingConvUserIds.has(user._id);
    return matchesSearch && notInConversations;
  }) || [];

  const handleHideConversation = async (convId: Id<"conversations">, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await hideConversation({ conversationId: convId });
      if (selectedConvId === convId) {
        setSelectedConvId(null);
      }
      toast.success("Sohbet gizlendi");
    } catch (error) {
      toast.error("Sohbet gizlenemedi");
    }
  };

  const handleStartConversation = async (userId: Id<"users">) => {
    console.log("Starting conversation with user:", userId);
    setLoadingTimeout(false); // Reset timeout state
    try {
      const convId = await getOrCreateConversation({ otherUserId: userId });
      console.log("Conversation created/found:", convId);
      
      // Set the conversation ID immediately
      setSelectedConvId(convId);
      setSearchQuery("");
      
      console.log("Selected conversation ID set to:", convId);
      
      // Wait a moment for the conversation to sync in the list
      // This ensures the unhide operation has completed
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Sohbet başlatılamadı");
      setSelectedConvId(null);
    }
  };

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
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MessageCircle className="w-5 h-5 text-[var(--neon-cyan)] flex-shrink-0" />
                  <span className="font-bold text-[var(--neon-cyan)] uppercase tracking-wide text-sm truncate">
                    {selectedConv ? selectedConv.otherUser?.username : hasSelectedConv ? "Yükleniyor..." : "Messages"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasSelectedConv && (
                    <button
                      onClick={() => {
                        setSelectedConvId(null);
                        setMessageInput("");
                        setShowEmojiPicker(false);
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      title="Sohbeti kapat"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-[var(--neon-cyan)] transition-colors p-1"
                    title="Pencereyi kapat"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              {!hasSelectedConv ? (
                // Conversation List
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Search Bar */}
                  <div className="p-3 border-b border-[var(--neon-cyan)]/20 bg-black/20 flex-shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neon-cyan)]" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Kullanıcı ara..."
                        className="pl-10 glass-card border border-[var(--neon-purple)]/20 text-sm"
                      />
                    </div>
                  </div>

                  {/* Conversations */}
                  <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                    <div className="p-2 space-y-1">
                      {conversations && conversations.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                          Henüz konuşma yok
                        </div>
                      )}
                      {searchQuery.trim() && 
                        filteredConversations.length === 0 && 
                        filteredFollowingUsers.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                          Kullanıcı bulunamadı
                        </div>
                      )}
                      
                      {/* Existing Conversations */}
                      {filteredConversations.map((conv) => (
                      <div
                        key={conv._id}
                        className="relative w-full p-3 glass-card border border-[var(--neon-purple)]/20 rounded hover:border-[var(--neon-cyan)]/40 transition-all flex items-center gap-3 group cursor-pointer"
                        onClick={() => setSelectedConvId(conv._id)}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center flex-shrink-0">
                          {conv.otherUser.avatar ? (
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
                              {conv.otherUser.username}
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
                          {!conv.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate">
                              Yeni sohbet
                            </p>
                          )}
                        </div>
                        
                        {/* Hide button */}
                        <button
                          onClick={(e) => handleHideConversation(conv._id, e)}
                          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                          title="Sohbeti gizle"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Following Users (only when searching) */}
                    {searchQuery.trim() && filteredFollowingUsers.length > 0 && (
                      <>
                        {filteredConversations.length > 0 && (
                          <div className="px-2 py-2 text-xs text-muted-foreground uppercase tracking-wide">
                            Takip Edilenler
                          </div>
                        )}
                        {filteredFollowingUsers.map((user) => (
                          <div
                            key={user._id}
                            onClick={() => handleStartConversation(user._id)}
                            className="w-full p-3 glass-card border border-[var(--neon-purple)]/20 rounded hover:border-[var(--neon-cyan)]/40 transition-all flex items-center gap-3 cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center flex-shrink-0">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <span className="font-semibold text-foreground text-sm truncate block">
                                {user.username}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Mesaj başlat
                              </p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    </div>
                  </div>
                </div>
              ) : (
                // Message View
                <div className="flex-1 flex flex-col min-h-0">
                  {!selectedConv ? (
                    // Loading state while conversation data syncs
                    <div className="flex-1 flex items-center justify-center p-8">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-[var(--neon-cyan)] animate-spin mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground uppercase tracking-wide">
                          Sohbet yükleniyor...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
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
                          const isImageMessage = msg.messageType === "image";
                          const hasImageStorage = isImageMessage && msg.imageUrl;
                          
                          // Generate proper storage URL from storage ID
                          let imageUrl: string | null = null;
                          if (hasImageStorage) {
                            const storageId = msg.imageUrl;
                            // Use the imported convexUrl (guaranteed to be defined)
                            imageUrl = `${convexUrl}/api/storage/${storageId}`;
                            console.log("Storage ID:", storageId);
                            console.log("Convex URL:", convexUrl);
                            console.log("Full image URL:", imageUrl);
                          }
                          
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
                                {isImageMessage && imageUrl ? (
                                  <div className="space-y-2">
                                    <img
                                      src={imageUrl}
                                      alt="Image"
                                      className="rounded w-full h-auto object-contain cursor-pointer"
                                      style={{ maxHeight: "300px" }}
                                      onClick={() => {
                                        window.open(imageUrl, "_blank");
                                      }}
                                      onError={(e) => {
                                        console.error("Image load error for URL:", imageUrl);
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
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
                  </>
                  )}
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
