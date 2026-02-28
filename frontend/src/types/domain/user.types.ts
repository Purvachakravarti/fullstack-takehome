import type { GetUsersQuery } from "@/__generated__/graphql";

export type UserRow = GetUsersQuery["users"][0];
