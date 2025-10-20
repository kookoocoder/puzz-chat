import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChatClient } from "@/components/chat/chat-client";
import { prisma } from "@/lib/prisma";

export default async function ChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  // Check if user has completed chess puzzle
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { chessCompleted: true },
  });

  if (!user?.chessCompleted) {
    redirect("/chess");
  }

  return <ChatClient currentUser={session.user} />;
}

