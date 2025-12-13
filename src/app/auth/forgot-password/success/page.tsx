import { ReturnButton } from "@/components/ui/return-button";

export default function Page() {
  // here we won't bother with the "auth guard" or "session check" that we used in profile/page.tsx; we don't need to protect the auth pages as much as the logged-in profile page
  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <ReturnButton href="/auth/login" label="Login" />

        <h1 className="text-3xl font-bold">Success</h1>
      </div>

      <p className="text-muted-foreground">
        Success! You have sent a password reset link to your email.
      </p>
    </div>
  );
}
