"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function markChessCompleted(): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { chessCompleted: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking chess as completed:", error);
    return { success: false, error: "Failed to update chess completion status" };
  }
}

export async function revokeChessCompletion(): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { chessCompleted: false },
    });

    return { success: true };
  } catch (error) {
    console.error("Error revoking chess completion:", error);
    return { success: false, error: "Failed to revoke chess completion status" };
  }
}

