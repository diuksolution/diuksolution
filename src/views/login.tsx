import Image from "next/image";
import Link from "next/link";
import { CredentialsSignInForm } from "@/components/auth/credentials-sign-in-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { LoginBrandPanel } from "@/components/auth/login-brand-panel";
import { Icon } from "@/components/ui/icon";

function loginErrorMessage(error?: string) {
  switch (error) {
    case "AccessDenied":
      return "This Google email is not registered for Google sign-in. Choose the Gmail that was added in DIUK, or ask an admin to add it first.";

    case "CredentialsSignin":
      return "Username or password is incorrect.";

    case "Configuration":
      return "Sign-in is not configured yet. Check the authentication environment variables.";

    default:
      return error ? "Sign-in failed. Please try again." : null;
  }
}

export function LoginView({ error }: { error?: string }) {
  const message = loginErrorMessage(error);

  return (
    <main className="flex min-h-dvh w-full bg-surface">
      <LoginBrandPanel />

      <section className="flex min-h-dvh flex-1 flex-col px-6 py-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col">
          <header className="flex items-center justify-between" />

          <div className="flex flex-1 flex-col justify-center py-12 sm:py-16">
            <div className="mb-4">
              <Link
                href="/"
                aria-label="DIUK home"
                className="flex items-center justify-center"
              >
                <Image
                  src="/logo.png"
                  alt="DIUK"
                  width={100}
                  height={100}
                  className="mb-8 object-contain"
                />
              </Link>

              <h1 className="text-[30px] font-bold tracking-[-0.025em] text-on-surface sm:text-[32px]">
                Welcome back
              </h1>

              <p className="mt-2.5 max-w-md text-[14px] leading-6 text-on-surface-variant">
                Sign in to manage your customer conversations,
                bookings, and business operations.
              </p>
            </div>

            {message ? (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-error/15 bg-error/5 px-4 py-3.5 text-[13px] leading-5 text-error"
              >
                <Icon
                  name="error"
                  className="mt-0.5 shrink-0 text-base leading-none"
                />

                <p>{message}</p>
              </div>
            ) : null}

            <GoogleSignInButton />

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-outline-variant" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-outline">
                or
              </span>

              <div className="h-px flex-1 bg-outline-variant" />
            </div>

            <CredentialsSignInForm />

            <div className="mt-8 rounded-xl bg-surface-container-low px-4 py-3.5 text-center">
              <p className="text-[13px] leading-5 text-on-surface-variant">
                Need an account?{" "}
                <span className="font-medium text-on-surface">
                  Contact your administrator.
                </span>
              </p>
            </div>
          </div>

          <footer className="pb-2 text-center text-[11px] leading-5 text-outline">
            <p>
              By continuing, you agree to DIUK&apos;s{" "}
              <Link
                href="/"
                className="underline underline-offset-2 transition-colors hover:text-on-surface-variant"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="/"
                className="underline underline-offset-2 transition-colors hover:text-on-surface-variant"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <p className="mt-1">© 2026 DIUK Solution</p>
          </footer>
        </div>
      </section>
    </main>
  );
}
