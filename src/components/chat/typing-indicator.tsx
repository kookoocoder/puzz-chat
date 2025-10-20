"use client";

import type { TypingUser } from "@/app/chat/actions";

interface TypingIndicatorProps {
  users: TypingUser[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) {
    return null;
  }

  const formatUserNames = () => {
    if (users.length === 1) {
      return `${users[0].name} is typing`;
    } else if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing`;
    } else if (users.length === 3) {
      return `${users[0].name}, ${users[1].name}, and ${users[2].name} are typing`;
    } else {
      return `${users[0].name}, ${users[1].name}, and ${users.length - 2} others are typing`;
    }
  };

  return (
    <div className="border-t bg-card px-6 py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{formatUserNames()}...</span>
      </div>
    </div>
  );
}

