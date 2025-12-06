import { SignOutButton } from "@/components/sign-out-button";
import { ReturnButton } from "@/components/ui/return-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  // this "auth guard" or "session check" is second line of defence, after middleware (AKA proxy)
  // if somehow middleware is bypassed, this part will prevent you from accessing the page
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/auth/login");

  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <ReturnButton href="/" label="Home" />

        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      <SignOutButton />

      <pre className="text-sm overflow-clip">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  );
}
