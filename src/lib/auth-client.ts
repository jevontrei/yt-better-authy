import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  adminClient,
  customSessionClient,
  magicLinkClient,
} from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";
import { ac, roles } from "@/lib/permissions";

// re auth import: auth is not a type, but we can use the `type` keyword because we're only using it as a type

// the main point of passing everything to the auth client is so that it can also do these things;
// remember how he said that all these APIs are available on the client and the auth, but if i don't pass e.g. the magicLinkClient in here, i won't be able to use it on the client (but i will still be able to use it on the server)
// so this all allows the client and server to have parallel behaviour

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // Problem was: client session has no context of the role
  // inferAdditionalFields allows things like the role to show up when we hover over session in get-started-button.tsx
  // Understand this <typeof auth> syntax
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({ ac, roles }),
    // we use customSessionClient to implement what we did in customSession in auth.ts, but now here on the client; so when we hover user, e.g. in get-started-button.tsx, we get our desired fields/types, instead of just everything from the session
    customSessionClient<typeof auth>(),
    magicLinkClient(),
  ],
});

// all these functions that we're using on the client can also be used on the server, i'm pretty sure, with `auth.api.____`, and vice versa. E.g. you could do `auth.api.sendVerificationEmail` on the server. but the client side is somewhat easier to work with (but has security tradeoffs)
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
  changePassword,
  updateUser,
} = authClient;
