import type { UserStatus, UserSummary } from "@repo/contracts";
import { createHttpClient } from "@repo/http";
import type { Paginated } from "@repo/types";
import { inviteUserSchema, userPageSchema, userSummarySchema, type InviteUserInput } from "@repo/validators";

export interface UserListParams {
  readonly query: string;
  readonly status: UserStatus | "all";
  readonly page: number;
  readonly pageSize: number;
}

const getClient = () => createHttpClient("");

const parsePayload = <T>(payload: unknown, parser: { safeParse(input: unknown): { success: true; data: T } | { success: false } }): T => {
  const result = parser.safeParse(payload);
  if (!result.success) throw new Error("The server returned an invalid users response.");
  return result.data;
};

export async function listUsers(input: UserListParams, signal?: AbortSignal): Promise<Paginated<UserSummary>> {
  const params = new URLSearchParams({ query: input.query, status: input.status, page: String(input.page), pageSize: String(input.pageSize) });
  return parsePayload(await getClient().get<unknown>(`/api/users?${params.toString()}`, { signal, cache: "no-store" }), userPageSchema);
}

export async function createUser(input: InviteUserInput): Promise<UserSummary> {
  const validated = inviteUserSchema.parse(input);
  return parsePayload(await getClient().post<unknown, InviteUserInput>("/api/users", validated), userSummarySchema);
}

export async function updateUserStatus(id: string, status: UserStatus): Promise<UserSummary> {
  return parsePayload(await getClient().patch<unknown, { status: UserStatus }>(`/api/users/${encodeURIComponent(id)}`, { status }), userSummarySchema);
}

export async function removeUser(id: string): Promise<void> {
  await getClient().delete(`/api/users/${encodeURIComponent(id)}`);
}
