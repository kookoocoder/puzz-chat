import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AdminClient } from "@/components/admin/admin-client";
import { checkIsAdmin } from "@/lib/admin";
import { getAllUsers, getChatSettings } from "./actions";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect("/auth");
  }

  const isAdmin = await checkIsAdmin();
  
  if (!isAdmin) {
    redirect("/dashboard");
  }

  const users = await getAllUsers();
  const chatSettings = await getChatSettings();

  return (
    <AdminClient
      currentUser={session.user}
      users={users}
      chatSettings={chatSettings}
    />
  );
}

