import { SendVerificationEmailForm } from "@/components/send-verification-email-form";
import { ReturnButton } from "@/components/ui/return-button";
import { redirect } from "next/navigation";

interface PageProps {
  // in next.js, the query param comes in as a prop to your pages
  searchParams: Promise<{ error: string }>;
}

// async component
export default async function Page({ searchParams }: PageProps) {
  const error = (await searchParams).error;

  // understand this. 4:24:34. why is it (!error), rather than (error)?
  if (!error) redirect("/profile");

  // here we won't bother with the "auth guard" or "session check" that we used in profile/page.tsx; we don't need to protect the auth pages as much as the logged-in profile page
  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <ReturnButton href="/auth/login" label="Login" />

        <h1 className="text-3xl font-bold">Verify Email</h1>
      </div>

      <p className="text-destructive">
        {/* we know about this error because when we tried to log in via google after registering via github, we got redirected to: http://localhost:3000/auth/login/error?error=account_not_linked, and that's because we turned off accountLinking in auth.ts */}
        {/* this is a double ternary operator, which is a bit ugly, but better than triple ternary, lol */}
        {error === "invalid_token" || error === "token_expired"
          ? "Your token is invalid or expired. Please request a new one."
          : // here we catch the custom error/message (query param?) we made in sign-in-email.action.ts
          error === "email_not_verified"
          ? "Please verify your email, or request a new verification below"
          : "Oops! Something went wrong. Please try again."}
      </p>

      <SendVerificationEmailForm />
    </div>
  );
}
