"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type CredentialsLoginState = {
  error?: string;
};

export async function loginWithCredentials(
  _prevState: CredentialsLoginState,
  formData: FormData,
): Promise<CredentialsLoginState> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid username or password." };
    }

    throw error;
  }

  return {};
}
