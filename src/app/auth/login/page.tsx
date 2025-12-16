import { LoginForm } from "@/components/login-form";
import { MagicLinkLoginForm } from "@/components/magic-link-login-form";
import { SignInOauthButton } from "@/components/sign-in-oauth-button";
import { ReturnButton } from "@/components/ui/return-button";
import Link from "next/link";

export default function Page() {
  // here we won't bother with the "auth guard" or "session check" that we used in profile/page.tsx; we don't need to protect the auth pages as much as the logged-in profile page
  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <ReturnButton href="/" label="Home" />

        <h1 className="text-3xl font-bold">Login</h1>
      </div>

      <div className="space-y-4">
        <MagicLinkLoginForm />

        <LoginForm />

        <p className="text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="hover:text-foreground">
            Register
          </Link>
        </p>

        <hr className="max-w-sm" />
      </div>

      <div className="flex flex-col max-w-sm gap-4">
        <SignInOauthButton provider="google" />
        <SignInOauthButton provider="github" />
      </div>
    </div>
  );
}
