import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChatWrapper } from "@/components/chat/chat-wrapper";
import { prisma } from "@/lib/prisma";
import { checkIsAdmin } from "@/lib/admin";
import { getChatSettings } from "@/app/admin/actions";

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
    select: { chessCompleted: true, isAdmin: true },
  });

  if (!user?.chessCompleted) {
    redirect("/chess");
  }

  // Check if chat is enabled (admins can always access)
  const isAdmin = await checkIsAdmin();
  const chatSettings = await getChatSettings();
  
  if (!chatSettings.isEnabled && !isAdmin) {
    redirect("/dashboard");
  }

  return <ChatWrapper currentUser={session.user} isAdmin={isAdmin} chatEnabled={chatSettings.isEnabled} />;
}

