"use client";

import { useEffect, useRef } from "react";
import { MessageItem } from "./message-item";
import type { MessageWithUser } from "@/app/chat/actions";

interface MessageListProps {
  messages: MessageWithUser[];
  currentUserId: string;
  onMessageEdited: (messageId: string, newContent: string) => void;
  onMessageDeleted: (messageId: string) => void;
}

export function MessageList({
  messages,
  currentUserId,
  onMessageEdited,
  onMessageDeleted,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const previousMessagesLengthRef = useRef(messages.length);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Auto-scroll when new messages arrive
    if (messages.length > previousMessagesLengthRef.current) {
      scrollToBottom();
    }
    previousMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  const groupMessagesByDate = (messages: MessageWithUser[]) => {
    const groups: { [key: string]: MessageWithUser[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt);
      const dateKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground">
          No messages yet. Be the first to say something!
        </p>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="h-full overflow-y-auto p-4 space-y-4"
    >
      {Object.entries(messageGroups).map(([date, groupMessages]) => (
        <div key={date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="border-t flex-1" />
            <span className="px-4 text-xs text-muted-foreground">{date}</span>
            <div className="border-t flex-1" />
          </div>

          {/* Messages for this date */}
          <div className="space-y-4">
            {groupMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isOwnMessage={message.userId === currentUserId}
                onMessageEdited={onMessageEdited}
                onMessageDeleted={onMessageDeleted}
              />
            ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

