"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearSessionCookie, requireCurrentUser } from "@/lib/auth/session";
import { decideApprovalRequest } from "@/server/repositories/approval-repository";

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function decideApprovalAction(formData: FormData) {
  const currentUser = await requireCurrentUser();
  const approvalRequestId = String(formData.get("approvalRequestId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  if (decision !== "APPROVED" && decision !== "REJECTED") {
    throw new Error("Invalid approval decision.");
  }

  await decideApprovalRequest({
    approvalRequestId,
    decision,
    decidedByUserId: currentUser.id
  });

  revalidatePath("/dashboard");
  revalidatePath("/runs");
  revalidatePath("/governance");
}
