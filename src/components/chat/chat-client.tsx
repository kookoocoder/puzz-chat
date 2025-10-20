"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  getMessages,
  getOnlineUsers,
  setUserOnline,
  setUserOffline,
  cleanupOldMessages,
  type MessageWithUser,
  type TypingUser,
  type OnlineUser,
} from "@/app/chat/actions";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { OnlineUsers } from "./online-users";
import { TypingIndicator } from "./typing-indicator";
import { pusherClient } from "@/lib/pusher-client";
import { CHAT_CHANNEL } from "@/lib/pusher-shared";
import type { ChatEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Users, X, Shield, Trash2, Power, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearAllMessages, toggleChatEnabled } from "@/app/admin/actions";
import { toast } from "sonner";

interface ChatClientProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  isAdmin?: boolean;
  chatEnabled?: boolean;
}

export function ChatClient({ currentUser, isAdmin = false, chatEnabled = true }: ChatClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [replyTo, setReplyTo] = useState<MessageWithUser | null>(null);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const handleClearChat = async () => {
    if (!confirm("Clear all messages? This cannot be undone!")) return;
    
    setAdminLoading(true);
    try {
      const result = await clearAllMessages();
      if (result.success) {
        toast.success(`Cleared ${result.count} messages`);
        mutateMessages();
      } else {
        toast.error(result.error || "Failed to clear messages");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleToggleChat = async () => {
    setAdminLoading(true);
    try {
      const result = await toggleChatEnabled();
      if (result.success) {
        toast.success(result.isEnabled ? "Chat enabled" : "Chat disabled");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to toggle chat");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setAdminLoading(false);
    }
  };

  // Fetch messages - rare background reconcile only; Pusher handles realtime
  const {
    data: messages = [],
    error: messagesError,
    mutate: mutateMessages,
  } = useSWR<MessageWithUser[]>("messages", getMessages, {
    refreshInterval: 60000, // 60s background reconcile for consistency
    revalidateOnFocus: false,
    dedupingInterval: 0,
  });

  // Initial fetch of online users and cleanup old messages
  useEffect(() => {
    getOnlineUsers().then(setOnlineUsers).catch(() => {});
    // Cleanup messages older than 24 hours on mount
    cleanupOldMessages().catch(() => {});
  }, []);

  // Announce presence and handle cleanup on mount/unmount
  useEffect(() => {
    // Announce user is online
    setUserOnline().catch(() => {});

    return () => {
      // Announce user is offline on unmount
      setUserOffline().catch(() => {});
    };
  }, []);

  // Realtime subscriptions via Pusher
  useEffect(() => {
    const channel = pusherClient.subscribe(CHAT_CHANNEL);

    const handleEvent = (data: ChatEvent) => {
      switch (data.type) {
        case "message:new":
          mutateMessages(
            async (cur) => {
              const m = data.payload.message;
              const message: MessageWithUser = {
                ...m,
                createdAt: new Date(m.createdAt),
                updatedAt: new Date(m.updatedAt),
              } as MessageWithUser;
              // Avoid duplicates (filter out temp ids and existing by id)
              const filtered = (cur || []).filter(
                (x) => x.id !== message.id && !x.id.startsWith("temp-")
              );
              return [...filtered, message];
            },
            { revalidate: false }
          );
          break;
        case "message:edit":
          mutateMessages(
            async (cur) =>
              cur?.map((m) =>
                m.id === data.payload.id
                  ? { ...m, content: data.payload.content, isEdited: true, updatedAt: new Date() }
                  : m
              ),
            { revalidate: false }
          );
          break;
        case "message:delete":
          mutateMessages(
            async (cur) =>
              cur?.map((m) => (m.id === data.payload.id ? { ...m, isDeleted: true, content: "" } : m)),
            { revalidate: false }
          );
          break;
      }
    };

    channel.bind("message:new", handleEvent);
    channel.bind("message:edit", handleEvent);
    channel.bind("message:delete", handleEvent);

    // Typing indicators - instant via Pusher
    channel.bind("typing:start", (data: ChatEvent) => {
      if (data.type !== "typing:start") return;
      const user = data.payload.user;
      // Don't show our own typing indicator
      if (user.id === currentUser.id) return;
      setTypingUsers((cur) => {
        // Avoid duplicates
        if (cur.find((u) => u.id === user.id)) return cur;
        return [...cur, user];
      });
    });

    channel.bind("typing:stop", (data: ChatEvent) => {
      if (data.type !== "typing:stop") return;
      setTypingUsers((cur) => cur.filter((u) => u.id !== data.payload.userId));
    });

    // Online/Offline presence - instant via Pusher
    channel.bind("user:online", (data: ChatEvent) => {
      if (data.type !== "user:online") return;
      const user = data.payload.user;
      // Don't add ourselves
      if (user.id === currentUser.id) return;
      setOnlineUsers((cur) => {
        // Avoid duplicates
        if (cur.find((u) => u.id === user.id)) return cur;
        return [...cur, {
          ...user,
          updatedAt: new Date(user.updatedAt),
        }];
      });
    });

    channel.bind("user:offline", (data: ChatEvent) => {
      if (data.type !== "user:offline") return;
      setOnlineUsers((cur) => cur.filter((u) => u.id !== data.payload.userId));
    });

    return () => {
      channel.unbind("message:new", handleEvent);
      channel.unbind("message:edit", handleEvent);
      channel.unbind("message:delete", handleEvent);
      channel.unbind("typing:start");
      channel.unbind("typing:stop");
      channel.unbind("user:online");
      channel.unbind("user:offline");
      pusherClient.unsubscribe(CHAT_CHANNEL);
    };
  }, [mutateMessages, currentUser.id]);

  const handleMessageSent = async (optimisticMessage: MessageWithUser) => {
    // Optimistically update the UI immediately
    mutateMessages(
      async (currentMessages) => {
        // Add the new message to the current list
        return [...(currentMessages || []), optimisticMessage];
      },
      {
        revalidate: false, // Don't revalidate immediately
      }
    );

    // Revalidate in the background after a short delay
    setTimeout(() => {
      mutateMessages();
    }, 500);
  };

  const handleMessageEdited = (messageId: string, newContent: string) => {
    // Optimistically update the edited message
    mutateMessages(
      async (currentMessages) => {
        return currentMessages?.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent, isEdited: true, updatedAt: new Date() }
            : msg
        );
      },
      {
        revalidate: false,
      }
    );

    // Revalidate after a short delay
    setTimeout(() => {
      mutateMessages();
    }, 500);
  };

  const handleMessageDeleted = (messageId: string) => {
    // Optimistically update the deleted message
    mutateMessages(
      async (currentMessages) => {
        return currentMessages?.map((msg) =>
          msg.id === messageId
            ? { ...msg, isDeleted: true, content: "" }
            : msg
        );
      },
      {
        revalidate: false,
      }
    );

    // Revalidate after a short delay
    setTimeout(() => {
      mutateMessages();
    }, 500);
  };

  if (messagesError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">
          Failed to load messages. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="border-b bg-card px-3 sm:px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">Global Chat</h1>
                {isAdmin && (
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" />
                )}
                {!chatEnabled && (
                  <span className="text-xs bg-red-600 px-2 py-1 rounded text-white">Disabled</span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                Welcome, {currentUser.name}
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Admin Controls */}
              {isAdmin && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/admin")}
                    className="h-8 w-8 sm:h-9 sm:w-9 text-purple-500 hover:text-purple-400 hidden sm:flex"
                    title="Admin Panel"
                  >
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleChat}
                    disabled={adminLoading}
                    className="h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex"
                    title={chatEnabled ? "Disable Chat" : "Enable Chat"}
                  >
                    {chatEnabled ? (
                      <PowerOff className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    ) : (
                      <Power className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearChat}
                    disabled={adminLoading}
                    className="h-8 w-8 sm:h-9 sm:w-9 text-red-500 hover:text-red-400 hidden sm:flex"
                    title="Clear All Messages"
                  >
                    <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </>
              )}
              {/* Mobile toggle for online users */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                className="md:hidden h-8 w-8 sm:h-9 sm:w-9"
              >
                {showOnlineUsers ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Users className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-hidden min-h-0">
          <MessageList
            messages={messages}
            currentUserId={currentUser.id}
            onMessageEdited={handleMessageEdited}
            onMessageDeleted={handleMessageDeleted}
            onReply={(message) => setReplyTo(message)}
          />
        </div>

        {/* Typing indicator */}
        {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

        {/* Message input */}
        <div className="border-t bg-card p-2.5 sm:p-3 md:p-4 flex-shrink-0">
          <MessageInput 
            currentUser={currentUser} 
            onMessageSent={handleMessageSent}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
          />
        </div>
      </div>

      {/* Online users sidebar - Hidden on mobile by default */}
      <aside 
        className={`
          ${showOnlineUsers ? 'flex' : 'hidden'} 
          md:flex
          w-full md:w-64 
          border-l bg-card
          absolute md:relative
          right-0 top-0 bottom-0
          z-50 md:z-auto
          flex-shrink-0
        `}
      >
        <OnlineUsers users={onlineUsers} currentUserId={currentUser.id} />
      </aside>

      {/* Mobile overlay */}
      {showOnlineUsers && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setShowOnlineUsers(false)}
        />
      )}
    </div>
  );
}

