"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher-server";
import { CHAT_CHANNEL } from "@/lib/pusher-shared";
import type { ChatEvent } from "@/lib/types";
import { hash } from "bcrypt";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  chessCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  image: string | null;
  _count: {
    messages: number;
  };
}

export async function getAllUsers(): Promise<AdminUser[]> {
  await requireAdmin();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isAdmin: true,
      chessCompleted: true,
      createdAt: true,
      updatedAt: true,
      image: true,
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  isAdmin: boolean = false
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    await requireAdmin();

    // Validate input
    if (!name || name.trim().length < 2) {
      return { success: false, error: "Name must be at least 2 characters" };
    }

    if (!email || !email.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }

    if (!password || password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        emailVerified: true,
        isAdmin,
        accounts: {
          create: {
            id: crypto.randomUUID(),
            accountId: email.toLowerCase(),
            providerId: "credential",
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    });

    revalidatePath("/admin");
    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    // Prevent admin from deleting themselves
    if (admin.id === userId) {
      return { success: false, error: "Cannot delete your own account" };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function toggleAdminStatus(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    // Prevent admin from removing their own admin status
    if (admin.id === userId) {
      return { success: false, error: "Cannot modify your own admin status" };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: !user.isAdmin },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error toggling admin status:", error);
    return { success: false, error: "Failed to update admin status" };
  }
}

export async function resetUserPassword(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" };
    }

    const hashedPassword = await hash(newPassword, 10);

    await prisma.account.updateMany({
      where: {
        userId,
        providerId: "credential",
      },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

export async function clearAllMessages(): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    const admin = await requireAdmin();

    const result = await prisma.message.deleteMany({});

    // Broadcast chat cleared event
    const event: ChatEvent = {
      type: "message:new", // This will trigger a refresh
      payload: {
        message: {
          id: "system",
          content: "Chat has been cleared by admin",
          userId: admin.id,
          isDeleted: false,
          isEdited: false,
          replyToId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: admin.id,
            name: admin.name,
            image: null,
          },
        },
      },
    };
    await pusherServer.trigger(CHAT_CHANNEL, "chat:cleared", event);

    revalidatePath("/chat");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error clearing messages:", error);
    return { success: false, error: "Failed to clear messages" };
  }
}

export async function getChatSettings(): Promise<{ isEnabled: boolean }> {
  try {
    const settings = await prisma.chatSettings.findFirst();
    return { isEnabled: settings?.isEnabled ?? true };
  } catch {
    return { isEnabled: true };
  }
}

export async function toggleChatEnabled(): Promise<{ success: boolean; isEnabled?: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();

    const existingSettings = await prisma.chatSettings.findFirst();

    let newSettings;
    if (existingSettings) {
      newSettings = await prisma.chatSettings.update({
        where: { id: existingSettings.id },
        data: {
          isEnabled: !existingSettings.isEnabled,
          updatedBy: admin.id,
          updatedAt: new Date(),
        },
      });
    } else {
      newSettings = await prisma.chatSettings.create({
        data: {
          isEnabled: false,
          updatedBy: admin.id,
        },
      });
    }

    // Broadcast chat status change
    const event: ChatEvent = {
      type: "message:new",
      payload: {
        message: {
          id: "system",
          content: newSettings.isEnabled ? "Chat enabled by admin" : "Chat disabled by admin",
          userId: admin.id,
          isDeleted: false,
          isEdited: false,
          replyToId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: admin.id,
            name: admin.name,
            image: null,
          },
        },
      },
    };
    await pusherServer.trigger(CHAT_CHANNEL, "chat:toggled", event);

    revalidatePath("/chat");
    revalidatePath("/admin");
    return { success: true, isEnabled: newSettings.isEnabled };
  } catch (error) {
    console.error("Error toggling chat:", error);
    return { success: false, error: "Failed to toggle chat" };
  }
}

