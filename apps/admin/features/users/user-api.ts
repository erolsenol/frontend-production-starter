import type { UserStatus, UserSummary } from "@repo/contracts";
import type { Paginated } from "@repo/types";
import { inviteUserSchema, userPageSchema, userSummarySchema, type InviteUserInput } from "@repo/validators";

export interface UserListParams {
  readonly query: string;
  readonly status: UserStatus | "all";
  readonly page: number;
  readonly pageSize: number;
}

const readErrorMessage = async (response: Response): Promise<string> => {
  const payload: unknown = await response.json().catch(() => undefined);
  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const error = payload.error;
    if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") return error.message;
  }
  return "Something went wrong. Please try again.";
};

const parseResponse = async <T>(response: Response, parser: { safeParse(input: unknown): { success: true; data: T } | { success: false } }): Promise<T> => {
  if (!response.ok) throw new Error(await readErrorMessage(response));
  const result = parser.safeParse(await response.json());
  if (!result.success) throw new Error("The server returned an invalid users response.");
  return result.data;
};

export async function listUsers(input: UserListParams, signal?: AbortSignal): Promise<Paginated<UserSummary>> {
  const params = new URLSearchParams({ query: input.query, status: input.status, page: String(input.page), pageSize: String(input.pageSize) });
  return parseResponse(await fetch(`/api/users?${params.toString()}`, { signal, cache: "no-store" }), userPageSchema);
}

export async function createUser(input: InviteUserInput): Promise<UserSummary> {
  const validated = inviteUserSchema.parse(input);
  return parseResponse(await fetch("/api/users", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(validated) }), userSummarySchema);
}

export async function updateUserStatus(id: string, status: UserStatus): Promise<UserSummary> {
  return parseResponse(await fetch(`/api/users/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) }), userSummarySchema);
}

export async function removeUser(id: string): Promise<void> {
  const response = await fetch(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await readErrorMessage(response));
}
