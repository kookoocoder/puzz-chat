"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { OnlineUser } from "@/app/chat/actions";

interface OnlineUsersProps {
  users: OnlineUser[];
  currentUserId: string;
}

export function OnlineUsers({ users, currentUserId }: OnlineUsersProps) {
  // Add current user to the list if not already present
  const allUsers = users.filter((user) => user.id !== currentUserId);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-4">
        <h2 className="font-semibold">
          Online Users ({allUsers.length + 1})
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {allUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Green dot for online status */}
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

