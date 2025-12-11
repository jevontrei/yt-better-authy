import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, adminClient } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";
import { ac, roles } from "@/lib/permissions";

// re auth import: auth is not a type, but we can use the `type` keyword because we're only using it as a type

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // Problem was: client session has no context of the role
  // inferAdditionalFields allows things like the role to show up when we hover over session in get-started-button.tsx
  // Understand this <typeof auth> syntax
  plugins: [inferAdditionalFields<typeof auth>(), adminClient({ ac, roles })],
});

export const { signUp, signOut, signIn, useSession, admin } = authClient;
