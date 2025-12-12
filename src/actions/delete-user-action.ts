"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// understand ({ userId }: { userId: string })
export async function deleteUserAction({ userId }: { userId: string }) {
  // since we want to await headers() twice in the same fn, which would be a bit silly, let's put it into a variable instead
  const headersList = await headers();

  // grab our session
  // now that we're doing an action, we want to check the session again, because this action could potentially be called by itseld
  const session = await auth.api.getSession({
    // remember to pass in headers when you're on a server component
    headers: headersList,
  });

  if (!session) throw new Error("Unauthorised");

  // if you're not an admin, you can't delete
  if (session.user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  try {
    // this is something of a second protection; we don't wanna delete admin users, at least not this way
    // by adding `role: "USER"` here, it's gonna fail if the user is not a USER role
    // it's a nice little extra constraint on our deletion query
    // i don't understand how this works. watch 2:37:20
    // // LEFT AS AN EXERCISE: delete user with admin plugin, like we did for getting users in src/app/admin/dashboard/page.tsx
    await prisma.user.delete({
      where: {
        id: userId,
        role: "USER",
      },
    });

    // if you are yourself
    // what is this doing? redirecting or signing out or deleting?
    if (session.user.id === userId) {
      await auth.api.signOut({
        headers: headersList,
      });
      // redirect() throws an error (as a form of control flow)
      // however, the docs say: redirect throws an error so it should be called OUTSIDE the try block when using try/catch statements.
      redirect("auth/sign-in");
    }

    // if you're not yourself... we can assume you're an admin? 2:38:55
    revalidatePath("/admin/dashboard");
    return { error: null };
  } catch (err) {
    // because redirect() throws an error, we need to catch it
    if (isRedirectError(err)) {
      // why throw again? to let next.js handle it
      throw err;
    }

    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "Internal server error" };
  }
}
