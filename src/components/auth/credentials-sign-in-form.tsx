"use client";

import { useActionState, useState } from "react";
import {
  loginWithCredentials,
  type CredentialsLoginState,
} from "@/lib/auth/login-actions";
import { Icon } from "@/components/ui/icon";

const initialState: CredentialsLoginState = {};

export function CredentialsSignInForm() {
  const [state, formAction, pending] = useActionState(
    loginWithCredentials,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const hasError = Boolean(state.error);

  const fieldClass = `h-11 w-full rounded-lg border bg-surface px-3.5 text-sm text-on-surface outline-none transition placeholder:text-outline focus:ring-2 ${
    hasError
      ? "border-error focus:border-error focus:ring-error/20"
      : "border-outline-variant focus:border-primary-dark focus:ring-primary/20"
  }`;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-on-surface"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          disabled={pending}
          placeholder="adminfnb"
          className={fieldClass}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-on-surface"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={pending}
            placeholder="Enter your password"
            className={`${fieldClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-outline hover:text-on-surface-variant"
          >
            <Icon
              name={showPassword ? "visibility_off" : "visibility"}
              className="text-[20px] leading-none"
            />
          </button>
        </div>
      </div>

      {state.error ? (
        <div className="flex items-start gap-2.5 rounded-lg border border-error/20 bg-error/5 px-3.5 py-3 text-sm text-error">
          <Icon name="error" className="mt-0.5 text-base leading-none" />
          <p>{state.error}</p>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white transition hover:bg-primary-dark focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? (
          <>
            <svg
              className="size-4 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}
