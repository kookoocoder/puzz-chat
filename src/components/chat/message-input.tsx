"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { sendMessage, updateTypingStatus, type MessageWithUser } from "@/app/chat/actions";
import { Send, X } from "lucide-react";
import { toast } from "sonner";

interface MessageInputProps {
  currentUser: {
    id: string;
    name: string;
    image?: string | null;
  };
  onMessageSent: (optimisticMessage: MessageWithUser) => void;
  replyTo: MessageWithUser | null;
  onCancelReply: () => void;
}

let typingTimeout: NodeJS.Timeout | null = null;
let throttleTimeout: NodeJS.Timeout | null = null;

export function MessageInput({ currentUser, onMessageSent, replyTo, onCancelReply }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [charCount, setCharCount] = useState(0);
  const isTypingRef = useRef(false);

  const clearTypingStatus = useCallback(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      typingTimeout = null;
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      // Fire and forget - don't await
      updateTypingStatus(false).catch(() => {});
    }
  }, []);

  const handleTyping = useCallback(() => {
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Throttle typing status updates to once per 800ms max
    if (!throttleTimeout && !isTypingRef.current) {
      isTypingRef.current = true;
      // Fire and forget - don't block UI
      updateTypingStatus(true).catch(() => {});
      
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, 800);
    }

    // Clear typing status after 1 second of inactivity
    typingTimeout = setTimeout(() => {
      clearTypingStatus();
    }, 1000);
  }, [clearTypingStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= 1000) {
      setContent(newContent);
      setCharCount(newContent.length);
      
      if (newContent.length > 0) {
        handleTyping();
      } else {
        // Immediately clear typing status when input is empty
        clearTypingStatus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    const messageContent = content.trim();
    const currentReplyTo = replyTo; // Capture current reply context
    
    // PRIORITY: Clear typing status IMMEDIATELY before anything else
    clearTypingStatus();
    
    // Create optimistic message for instant UI update
    const optimisticMessage: MessageWithUser = {
      id: `temp-${Date.now()}-${Math.random()}`, // Unique temporary ID
      content: messageContent,
      userId: currentUser.id,
      isDeleted: false,
      isEdited: false,
      replyToId: currentReplyTo?.id || null,
      replyTo: currentReplyTo ? {
        id: currentReplyTo.id,
        content: currentReplyTo.content,
        userId: currentReplyTo.userId,
        isDeleted: currentReplyTo.isDeleted,
        user: currentReplyTo.user,
      } : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: currentUser.id,
        name: currentUser.name,
        image: currentUser.image || null,
      },
    };

    // Clear input and reply immediately for better UX - allows next message typing
    setContent("");
    setCharCount(0);
    onCancelReply(); // Clear reply context
    
    // Update UI optimistically (instant feedback)
    onMessageSent(optimisticMessage);

    // Send in background without blocking UI
    try {
      // Send message to server (fire and forget - no blocking)
      await sendMessage(messageContent, currentReplyTo?.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
      // Don't restore content - user may have moved on to next message
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter without Shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Cleanup: Clear typing status when component unmounts
  useEffect(() => {
    return () => {
      clearTypingStatus();
    };
  }, [clearTypingStatus]);

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-2">
      {/* Reply banner */}
      {replyTo && (
        <div className="flex items-center gap-2 bg-muted/50 border-l-2 border-primary px-2.5 sm:px-3 py-1.5 sm:py-2 rounded text-sm">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-primary">
              Replying to {replyTo.user.name}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {replyTo.content}
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancelReply}
            className="h-6 w-6 p-0 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex gap-1.5 sm:gap-2">
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          className="flex-1 rounded-md border bg-background px-2.5 sm:px-3 py-2 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring touch-manipulation min-h-[80px] sm:min-h-0"
          rows={3}
          maxLength={1000}
        />
        <Button
          type="submit"
          disabled={!content.trim()}
          className="self-end h-10 w-10 sm:h-11 sm:w-11 p-0 touch-manipulation active:scale-95 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
        <span className="sm:hidden text-[10px]">Enter to send</span>
        <span className={charCount > 950 ? "text-destructive font-medium" : ""}>
          {charCount}/1000
        </span>
      </div>
    </form>
  );
}

