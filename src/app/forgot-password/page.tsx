import { redirect } from "next/navigation";

export default async function ForgotPasswordPage() {
  // Password reset is disabled - redirect to auth page
  redirect("/auth");
}
