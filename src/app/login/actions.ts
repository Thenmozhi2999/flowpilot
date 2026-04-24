"use server";

import { redirect } from "next/navigation";

import { setSessionCookie } from "@/lib/auth/session";
import { getUserById } from "@/server/repositories/auth-repository";

export async function loginAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");

  const user = await getUserById(userId);

  if (!user) {
    redirect("/login");
  }

  await setSessionCookie(user.id);
  redirect("/dashboard");
}
