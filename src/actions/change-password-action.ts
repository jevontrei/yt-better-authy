"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";

// note that some of my action files are .action.ts and some are -action.ts... i think it doesn't technically matter, but you should choose one

export async function changePasswordAction(formData: FormData) {
  const currentPassword = String(formData.get("currentPassword"));
  if (!currentPassword) return { error: "Please enter your current password" };

  const newPassword = String(formData.get("newPassword"));
  if (!newPassword) return { error: "Please enter your new password" };

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
      },
    });

    return { error: null };
  } catch (err) {
    // this is imported from "better-auth/api", NOT "better-auth"!
    if (err instanceof APIError) {
      return { error: err.message };
    }

    return { error: "Internal Server Error" };
  }
}
