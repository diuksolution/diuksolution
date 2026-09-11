import { signIn } from "@/auth";
import { GoogleSignInSubmitButton } from "@/components/auth/google-sign-in-submit-button";

export function GoogleSignInButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/admin" });
      }}
    >
      <GoogleSignInSubmitButton />
    </form>
  );
}
