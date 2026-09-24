import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node executes this TypeScript test directly.
import { getAccountIdentity } from "./account-identity.ts";
const cases = [
  ["super staff", { role: "STAFF", actorType: "STAFF", panelType: "SUPER_ADMIN" }, "superAdminStaff"],
  ["restaurant staff", { role: "STAFF", actorType: "STAFF", panelType: "BUSINESS_ADMIN" }, "restaurantAdminStaff"],
  ["branch staff", { role: "STAFF", actorType: "STAFF", panelType: "BRANCH_ADMIN" }, "branchAdminStaff"],
  ["super owner", { role: "SUPER_ADMIN" }, "superAdmin"],
  ["business owner", { role: "BUSINESS_ADMIN" }, "businessAdmin"],
  ["branch owner", { role: "BRANCH_ADMIN" }, "branchAdmin"],
  ["missing fields", { role: "STAFF", actorType: "STAFF" }, "staff"],
] as const;
for (const [name, user, expected] of cases) test(name, () => assert.equal(getAccountIdentity(user).labelKey, expected));
