import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ChessClient } from "@/components/chess/chess-client";

export default async function ChessPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect("/auth");
  }

  return (
    <ChessClient 
      userName={session.user.name}
      userImage={session.user.image || undefined}
    />
  );
}

