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
  const [isLoading, setIsLoading] = useState(false);
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

    if (!content.trim() || isLoading) {
      return;
    }

    const messageContent = content.trim();
    
    // PRIORITY: Clear typing status IMMEDIATELY before anything else
    clearTypingStatus();
    
    // Create optimistic message for instant UI update
    const optimisticMessage: MessageWithUser = {
      id: `temp-${Date.now()}`, // Temporary ID
      content: messageContent,
      userId: currentUser.id,
      isDeleted: false,
      isEdited: false,
      replyToId: replyTo?.id || null,
      replyTo: replyTo ? {
        id: replyTo.id,
        content: replyTo.content,
        userId: replyTo.userId,
        isDeleted: replyTo.isDeleted,
        user: replyTo.user,
      } : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: currentUser.id,
        name: currentUser.name,
        image: currentUser.image || null,
      },
    };

    // Clear input and reply immediately for better UX
    setContent("");
    setCharCount(0);
    onCancelReply(); // Clear reply context
    
    // Update UI optimistically (instant feedback)
    onMessageSent(optimisticMessage);

    setIsLoading(true);

    try {
      // Send message to server (PRIORITY - don't wait for typing status)
      await sendMessage(messageContent, replyTo?.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
      // Restore the content if sending failed
      setContent(messageContent);
      setCharCount(messageContent.length);
    } finally {
      setIsLoading(false);
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
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Reply banner */}
      {replyTo && (
        <div className="flex items-center gap-2 bg-muted/50 border-l-2 border-primary px-3 py-2 rounded">
          <div className="flex-1">
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
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={3}
          disabled={isLoading}
          maxLength={1000}
        />
        <Button
          type="submit"
          disabled={!content.trim() || isLoading}
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Press Enter to send, Shift+Enter for new line</span>
        <span className={charCount > 950 ? "text-destructive" : ""}>
          {charCount}/1000
        </span>
      </div>
    </form>
  );
}

