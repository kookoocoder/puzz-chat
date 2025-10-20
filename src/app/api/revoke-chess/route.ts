import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { chessCompleted: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking chess completion:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

