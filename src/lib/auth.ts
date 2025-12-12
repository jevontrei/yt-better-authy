import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin } from "better-auth/plugins";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/argon2";
import { getValidDomains, normaliseName } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { ac, roles } from "@/lib/permissions";

// this file is our main better auth configuration object

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      // he prefers using String() rather than `as string`
      clientId: String(process.env.GOOGLE_CLIENT_ID),
      clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
    },
    github: {
      // he prefers using String() rather than `as string`
      clientId: String(process.env.GITHUB_CLIENT_ID),
      clientSecret: String(process.env.GITHUB_CLIENT_SECRET),
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: false,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // this is a hook that runs BEFORE we get to "/sign-up/email"
      // so if you wanna do any tweaking to the data, we can do it here
      if (ctx.path === "/sign-up/email") {
        const email = String(ctx.body.email);
        const domain = email.split("@")[1];

        const VALID_DOMAINS = getValidDomains();
        if (!VALID_DOMAINS.includes(domain)) {
          // APIError is from "better-auth/api", NOT from "better-auth"
          throw new APIError("BAD_REQUEST", {
            message: "Invalid domain. Please use a valid email.",
          });
        }

        const name = normaliseName(ctx.body.name);

        return {
          context: {
            // spread current context
            ...ctx,
            // replace the body by spreading ctx.body and pass in new name
            body: {
              ...ctx.body,
              name,
            },
          },
        };
      }
    }),
  },
  // just like regular hooks, which can be run before or after endpoints, database hooks can be run before or after database queries
  databaseHooks: {
    // before a user query
    user: {
      // before a create user query
      create: {
        before: async (user) => {
          // `?.` is the optional chaining operator
          // `??` is the nullish coalescing operator
          const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(";") ?? [];

          if (ADMIN_EMAILS.includes(user.email)) {
            // `...` is the spread operator
            return { data: { ...user, role: UserRole.ADMIN } };
          }

          return { data: user };
        },
      },
    },
  },
  // get role info
  user: {
    additionalFields: {
      role: {
        type: ["USER", "ADMIN"] as Array<UserRole>,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60,
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },

  // this is the one-liner that replaces the manual cookie setting in sign-in-email.action.ts
  plugins: [
    nextCookies(),
    // it's called the "admin" plugin but it's more like an authorisation plugin -- what are you ALLOWED to do?
    admin({
      defaultRole: UserRole.USER,
      adminRoles: [UserRole.ADMIN], // by default, the admin plugin uses lower case: admin, user
      // ac (access control) and roles are from our permissions.ts
      ac,
      roles,
    }),
  ],
});

// make our own error type
export type ErrorCode = keyof typeof auth.$ERROR_CODES | "UNKNOWN";
