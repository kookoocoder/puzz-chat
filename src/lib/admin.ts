"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isAdmin: true },
    });

    return dbUser?.isAdmin || false;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const isAdmin = await checkIsAdmin();
  
  if (!isAdmin) {
    throw new Error("Admin access required");
  }
  
  const user = await getCurrentUser();
  return user;
}

