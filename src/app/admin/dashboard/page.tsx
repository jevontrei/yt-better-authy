// (used rfc shortcut here)
// this is one of our protected pages (protectedRoutes)

import {
  DeleteUserButton,
  PlaceholderDeleteUserButton,
} from "@/components/delete-user-button";
import { ReturnButton } from "@/components/ui/return-button";
import { UserRoleSelect } from "@/components/user-role-select";
import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// async server component
export default async function Page() {
  // since we want to await headers() twice in the same fn, which would be a bit silly, let's put it into a variable instead
  const headersList = await headers();

  // this "auth guard" or "session check" is second line of defence, after middleware (AKA proxy)
  // if somehow middleware is bypassed, this part will prevent you from accessing the page
  // first, grab the session
  const session = await auth.api.getSession({
    // remember to pass in headers when you're on a server component
    headers: headersList,
  });
  if (!session) redirect("/auth/login");

  // this is just UX displaying; it's not full protection; you want to always role-check whenever you're doing an actual action, but we'll do that later
  if (session.user.role !== "ADMIN") {
    return (
      <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
        <div className="space-y-8">
          <ReturnButton href="/profile" label="Profile" />

          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <p className="p-2 rounded-md text-lg bg-red-600 text-white font-bold">
            FORBIDDEN
          </p>
        </div>
      </div>
    );
  }

  // // SUPERSEDED; WE MOVED TO USING THE BETTER AUTH API INSTEAD (see below)
  // // get users using a prisma (postgres) query
  // const users = await prisma.user.findMany({
  //   orderBy: {
  //     name: "asc",
  //   },
  // });

  // let's use the better auth api (instead of a prisma query) to get our users
  const { users } = await auth.api.listUsers({
    headers: headersList,
    query: {
      sortBy: "name",
    },
  });

  // we want the admin dashboard to show the users sorted by name, but with admins on top
  const sortedUsers = users.sort((a, b) => {
    if (a.role === "ADMIN" && b.role !== "ADMIN") return -1;
    if (a.role !== "ADMIN" && b.role === "ADMIN") return 1;
    return 0;
  });

  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <ReturnButton href="/profile" label="Profile" />

        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <p className="p-2 rounded-md text-lg bg-green-600 text-white font-bold">
          ACCESS GRANTED
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="table-auto min-w-full whitespace-nowrap">
          <thead>
            <tr className="border-b text-sm text-left">
              <th className="px-2 py-2">ID</th>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Email</th>
              <th className="px-2 py-2 text-center">Role</th>
              <th className="px-2 py-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedUsers.map((user) => (
              <tr key={user.id} className="border-b text-sm text-left">
                <td className="px-4 py-2">{user.id.slice(0, 8)}</td>
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2 text-center">
                  <UserRoleSelect
                    userId={user.id}
                    // since role comes from the better auth api, it's typed as potentially undefined (unlike in prisma), so we cast it as UserRole
                    role={user.role as UserRole}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  {/* understand this logic */}
                  {user.role === "USER" ? (
                    <DeleteUserButton userId={user.id} />
                  ) : (
                    <PlaceholderDeleteUserButton />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
