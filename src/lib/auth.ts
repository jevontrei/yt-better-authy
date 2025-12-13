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
import { sendEmailAction } from "@/actions/send-email.action";

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
    requireEmailVerification: true,
    // similar to sendVerificationEmail
    sendResetPassword: async ({ user, url }) => {
      // this is an action that WE made
      await sendEmailAction({
        to: user.email,
        subject: "Reset Your Password",
        meta: {
          description: "Please click the link below to reset your password",
          // don't need String() here, because url is already a string (hover over url to see)
          link: url,
        },
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    // we won't need expiresIn because the default is already 60 * 60 = 3600; see docs: https://www.better-auth.com/docs/reference/options#emailverification
    // expiresIn: 60 * 60,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const link = new URL(url);
      // callbackURL was home page; let's change it to /auth/verify
      link.searchParams.set("callbackURL", "/auth/verify");

      await sendEmailAction({
        to: user.email,
        subject: "Verify Your Email Address",
        meta: {
          description:
            "Please verify your email address to complete registration.",
          link: String(link),
        },
      });
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
