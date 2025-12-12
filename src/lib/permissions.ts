import { UserRole } from "@prisma/client";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

// why use "as const" here?
const statements = {
  // hover over defaultStatements to see what rules/actions are allowed for each user by default
  ...defaultStatements,
  posts: ["create", "read", "update", "delete", "update:own", "delete:own"],
} as const;

// access control
export const ac = createAccessControl(statements);

export const roles = {
  [UserRole.USER]: ac.newRole({
    // these are now nicely typed/intellisensed for us!
    posts: ["create", "read", "update:own", "delete:own"],
  }),
  [UserRole.ADMIN]: ac.newRole({
    ...adminAc.statements,
    posts: ["create", "read", "update", "delete", "update:own", "delete:own"],
  }),
};
