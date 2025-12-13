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

// all these functions that we're using on the client can also be used on the server, i'm pretty sure, with `auth.api.____`, and vice versa. e.g. you could do `auth.api.sendVerificationEmail` on the server. but the client side is somewhat easier to work with (but has security tradeoffs? maybe?)
export const {
  signUp,
  signOut,
  signIn,
  useSession,
  admin,
  sendVerificationEmail,
  // forgetPassword was renamed to requestPasswordReset;  https://www.answeroverflow.com/m/1381375850582118481
  requestPasswordReset,
  resetPassword,
} = authClient;
