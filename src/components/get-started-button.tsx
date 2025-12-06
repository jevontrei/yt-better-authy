"use client";

import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// we are gonna access the session from the client

// use rafc shortcut here!
export const GetStartedButton = () => {
  // this is an example of getting the session on the client component; use the useSession() hook

  // call the useSession() hook and destructure
  // RENAME the variable with `data: session` for clarity
  const { data: session, isPending } = useSession();
  // more verbose equivalent to the above destructuring:
  //   const result = useSession();
  //   const session = result.data;
  //   const isPending = result.isPending;

  // we get a nice pending state for free in this hook; let's utilise it
  if (isPending) {
    // this pending state is gonna be happening when the component hasn't mounted yet; we need the component to mount because we're working in the client component
    return (
      <Button size="lg" className="opacity-50">
        Get Started
      </Button>
    );
  }

  // session might be null
  // dynamically render a link based on the session; either link to profile if you have a session, or login if not
  const href = session ? "/profile" : "/auth/login";

  return (
    <div className="flex flex-col items-center gap-4">
      <Button size="lg" asChild>
        <Link href={href}>Get Started</Link>
      </Button>
      {/* get emojis from https://emojidb.org/ */}
      {/* show name of session user if they're logged in */}
      {session && <p>Welcome back, {session.user.name}! 👋</p>}
    </div>
  );
};
