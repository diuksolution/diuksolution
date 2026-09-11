import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginView } from "@/views/login";

export const metadata: Metadata = {
  title: "Sign In | DIUK Solution",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
}) {
  const session = await auth();

  if (session?.user) {
    redirect("/admin");
  }

  const params = await searchParams;

  const errorValue = params.error;
  const error = Array.isArray(errorValue)
    ? errorValue[0]
    : errorValue;

  return <LoginView error={error} />;
}
