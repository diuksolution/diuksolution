"use client";

import { signOutAction } from "@/components/admin/sign-out-action";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={
          className ??
          "rounded-md px-3 py-1.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        }
      >
        Sign out
      </button>
    </form>
  );
}
