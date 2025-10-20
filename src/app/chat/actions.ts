"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher-server";
import { CHAT_CHANNEL } from "@/lib/pusher-shared";
import type { ChatEvent } from "@/lib/types";

export interface MessageWithUser {
  id: string;
  content: string;
  userId: string;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface TypingUser {
  id: string;
  name: string;
  image: string | null;
}

export interface OnlineUser {
  id: string;
  name: string;
  image: string | null;
  updatedAt: Date;
}

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

export async function getMessages(): Promise<MessageWithUser[]> {
  await getCurrentUser(); // Ensure user is authenticated

  const messages = await prisma.message.findMany({
    take: 100,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return messages.reverse(); // Return oldest first for display
}

export async function sendMessage(content: string): Promise<MessageWithUser> {
  const user = await getCurrentUser();

  if (!content || content.trim().length === 0) {
    throw new Error("Message content cannot be empty");
  }

  if (content.length > 1000) {
    throw new Error("Message cannot exceed 1000 characters");
  }

  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      userId: user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
  // Broadcast new message event
  const event: ChatEvent = {
    type: "message:new",
    payload: {
      message: {
        ...message,
        // Ensure date fields are serializable
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      },
    },
  };
  await pusherServer.trigger(CHAT_CHANNEL, "message:new", event);
  revalidatePath("/chat");
  return message;
}

export async function editMessage(
  messageId: string,
  newContent: string
): Promise<MessageWithUser> {
  const user = await getCurrentUser();

  if (!newContent || newContent.trim().length === 0) {
    throw new Error("Message content cannot be empty");
  }

  if (newContent.length > 1000) {
    throw new Error("Message cannot exceed 1000 characters");
  }

  // Verify the message belongs to the user
  const existingMessage = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!existingMessage) {
    throw new Error("Message not found");
  }

  if (existingMessage.userId !== user.id) {
    throw new Error("You can only edit your own messages");
  }

  if (existingMessage.isDeleted) {
    throw new Error("Cannot edit deleted messages");
  }

  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: {
      content: newContent.trim(),
      isEdited: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
  const event: ChatEvent = { type: "message:edit", payload: { id: updatedMessage.id, content: updatedMessage.content } };
  await pusherServer.trigger(CHAT_CHANNEL, "message:edit", event);
  revalidatePath("/chat");
  return updatedMessage;
}

export async function deleteMessage(messageId: string): Promise<void> {
  const user = await getCurrentUser();

  // Verify the message belongs to the user
  const existingMessage = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!existingMessage) {
    throw new Error("Message not found");
  }

  if (existingMessage.userId !== user.id) {
    throw new Error("You can only delete your own messages");
  }

  await prisma.message.update({
    where: { id: messageId },
    data: {
      isDeleted: true,
      content: "", // Clear content for privacy
    },
  });
  const event: ChatEvent = { type: "message:delete", payload: { id: messageId } };
  await pusherServer.trigger(CHAT_CHANNEL, "message:delete", event);
  revalidatePath("/chat");
}

export async function updateTypingStatus(isTyping: boolean): Promise<void> {
  const user = await getCurrentUser();

  await prisma.typingStatus.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      isTyping,
    },
    update: {
      isTyping,
      updatedAt: new Date(),
    },
  });

  // Broadcast typing events in realtime
  if (isTyping) {
    const event: ChatEvent = {
      type: "typing:start",
      payload: {
        user: {
          id: user.id,
          name: user.name,
          image: (user as any).image || null,
        },
      },
    };
    await pusherServer.trigger(CHAT_CHANNEL, "typing:start", event);
  } else {
    const event: ChatEvent = { type: "typing:stop", payload: { userId: user.id } };
    await pusherServer.trigger(CHAT_CHANNEL, "typing:stop", event);
  }
}

export async function getTypingUsers(): Promise<TypingUser[]> {
  const user = await getCurrentUser();

  // Get users who are typing (updated in the last 5 seconds)
  const fiveSecondsAgo = new Date(Date.now() - 5000);

  const typingStatuses = await prisma.typingStatus.findMany({
    where: {
      isTyping: true,
      updatedAt: {
        gte: fiveSecondsAgo,
      },
      userId: {
        not: user.id, // Exclude current user
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return typingStatuses.map((status) => status.user);
}

export async function getOnlineUsers(): Promise<OnlineUser[]> {
  await getCurrentUser();

  // Get users with sessions updated in the last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const sessions = await prisma.session.findMany({
    where: {
      updatedAt: {
        gte: fiveMinutesAgo,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          updatedAt: true,
        },
      },
    },
    distinct: ["userId"],
  });

  return sessions.map((session) => session.user);
}

