"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { editMessage, deleteMessage, type MessageWithUser } from "@/app/chat/actions";
import { Pencil, Trash2, Check, X, Reply } from "lucide-react";
import { toast } from "sonner";

interface MessageItemProps {
  message: MessageWithUser;
  isOwnMessage: boolean;
  onMessageEdited: (messageId: string, newContent: string) => void;
  onMessageDeleted: (messageId: string) => void;
  onReply: (message: MessageWithUser) => void;
  onScrollToMessage: (messageId: string) => void;
  isHighlighted: boolean;
}

export function MessageItem({
  message,
  isOwnMessage,
  onMessageEdited,
  onMessageDeleted,
  onReply,
  onScrollToMessage,
  isHighlighted,
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isLoading, setIsLoading] = useState(false);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      setEditContent(message.content);
      return;
    }

    const newContent = editContent.trim();
    
    // Update UI optimistically
    setIsEditing(false);
    onMessageEdited(message.id, newContent);
    toast.success("Message edited");

    setIsLoading(true);
    try {
      // Send edit to server in background
      await editMessage(message.id, newContent);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to edit message");
      // Restore original content on error
      setEditContent(message.content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    // Update UI optimistically
    onMessageDeleted(message.id);
    toast.success("Message deleted");

    setIsLoading(true);
    try {
      // Send delete to server in background
      await deleteMessage(message.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete message");
      // Note: The optimistic update will be reverted by SWR revalidation on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  if (message.isDeleted) {
    return (
      <div 
        id={`message-${message.id}`}
        className={`flex gap-3 opacity-50 ${isOwnMessage ? "justify-end" : ""} ${isHighlighted ? "bg-primary/20 animate-pulse" : ""}`}
      >
        {!isOwnMessage && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.user.image || undefined} />
            <AvatarFallback>
              {message.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <div className={`flex-1 max-w-[70%] ${isOwnMessage ? "text-right" : ""}`}>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-semibold text-sm">{message.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.createdAt)}
            </span>
          </div>
          <div className="text-sm italic text-muted-foreground">
            This message was deleted
          </div>
        </div>
        {isOwnMessage && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.user.image || undefined} />
            <AvatarFallback>
              {message.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }

  return (
    <div 
      id={`message-${message.id}`}
      className={`flex gap-3 group hover:bg-accent/50 rounded-lg p-2 -mx-2 transition-all ${isOwnMessage ? "flex-row-reverse" : ""} ${isHighlighted ? "bg-primary/20 ring-2 ring-primary/50" : ""}`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.user.image || undefined} />
        <AvatarFallback>
          {message.user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className={`flex-1 min-w-0 max-w-[70%] ${isOwnMessage ? "flex flex-col items-end" : ""}`}>
        <div className={`flex items-baseline gap-2 flex-wrap ${isOwnMessage ? "flex-row-reverse" : ""}`}>
          <span className="font-semibold text-sm">{message.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="text-xs text-muted-foreground italic">
              (edited)
            </span>
          )}
        </div>

        {/* Reply context */}
        {message.replyTo && !message.replyTo.isDeleted && (
          <button
            onClick={() => onScrollToMessage(message.replyTo!.id)}
            className={`mt-1 mb-1 p-2 rounded border-l-2 ${isOwnMessage ? "border-primary bg-primary/5 hover:bg-primary/10" : "border-muted bg-muted/30 hover:bg-muted/50"} text-xs cursor-pointer transition-colors w-full text-left`}
          >
            <div className="font-semibold text-muted-foreground">{message.replyTo.user.name}</div>
            <div className="text-muted-foreground truncate">{message.replyTo.content}</div>
          </button>
        )}

        {isEditing ? (
          <div className={`mt-1 space-y-2 w-full ${isOwnMessage ? "flex flex-col items-end" : ""}`}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
              rows={3}
              maxLength={1000}
              disabled={isLoading}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleEdit}
                disabled={isLoading || !editContent.trim()}
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className={`mt-1 rounded-lg px-3 py-2 ${isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        )}

        {!isEditing && (
          <div className={`mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isOwnMessage ? "flex-row-reverse" : ""}`}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onReply(message)}
              disabled={isLoading}
              className="h-7 px-2"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            {isOwnMessage && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  disabled={isLoading}
                  className="h-7 px-2"
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="h-7 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

