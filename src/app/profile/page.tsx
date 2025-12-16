import { ChangePasswordForm } from "@/components/change-password-form";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import { ReturnButton } from "@/components/ui/return-button";
import { UpdateUserForm } from "@/components/update-user-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

// async server component
export default async function Page() {
  // since we want to await headers() twice in the same fn, which would be a bit silly, let's put it into a variable instead
  // headers tells us WHICH USER IS LOGGED IN... their session
  const headersList = await headers();

  // this "auth guard" or "session check" is second line of defence, after middleware (AKA proxy)
  // if somehow middleware is bypassed, this part will prevent you from accessing the page
  // first, grab the session
  const session = await auth.api.getSession({
    // remember to pass in headers when you're on a server component
    headers: headersList,
  });
  if (!session) redirect("/auth/login");

  // add some checks
  const FULL_POST_ACCESS = await auth.api.userHasPermission({
    headers: headersList,
    body: {
      permissions: {
        // if they can do this, that means they have full post access
        posts: ["update", "delete"],
      },
    },
  });

  console.log(FULL_POST_ACCESS);

  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <ReturnButton href="/" label="Home" />

        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      <div className="flex items-center gap-2">
        {session.user.role === "ADMIN" && (
          <Button size="sm" asChild>
            <Link href="/admin/dashboard">Admin Dashboard</Link>
          </Button>
        )}
        <SignOutButton />
      </div>

      <div className="text-2x font-bold">Permissions</div>

      <div className="space-x-4">
        <Button size="sm">MANAGE OWN POSTS</Button>
        <Button size="sm" disabled={!FULL_POST_ACCESS.success}>
          MANAGE ALL POSTS
        </Button>
      </div>

      {session.user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={session.user.image}
          alt="User Image"
          className="size-24 border border-primary rounded-md object-over"
        />
      ) : (
        <div className="size-24 border border-primary rounded-md bg-primary text-primary-foreground flex items-center justify-center">
          <span className="uppercase text-lg font-bold">
            {session.user.name.slice(0, 2)}
          </span>
        </div>
      )}

      <pre className="text-sm overflow-clip">
        {JSON.stringify(session, null, 2)}
      </pre>

      <div className="space-y-4 p-4 rounded-b-md border border-t-8 border-blue-600">
        <h2 className="text-2xl font-bold">Update User</h2>

        <UpdateUserForm
          name={session.user.name}
          image={session.user.image ?? ""}
        />
      </div>

      <div className="space-y-4 p-4 rounded-b-md border border-t-8 border-red-600">
        <h2 className="text-2xl font-bold">Change Password</h2>

        <ChangePasswordForm />
      </div>
    </div>
  );
}
