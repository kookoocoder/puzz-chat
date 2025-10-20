import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getGamesData } from "@/lib/games-data";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect("/auth");
  }

  const gamesData = await getGamesData();
  const topGamesCategory = gamesData.find((cat) => cat.id === "top-games");
  const games = topGamesCategory?.games || [];

  return (
    <DashboardClient
      userName={session.user.name}
      userEmail={session.user.email}
      userImage={session.user.image || undefined}
      games={games}
    />
  );
}
