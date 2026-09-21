import type { ApiErrorShape } from "@repo/types";

export class HttpError extends Error implements ApiErrorShape {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  constructor(input: { code?: string; message: string; status: number; details?: unknown }) { super(input.message); this.name = "HttpError"; this.code = input.code ?? "HTTP_ERROR"; this.status = input.status; this.details = input.details; }
}

export interface HttpClient { get<T>(path: string, init?: RequestInit): Promise<T>; post<T, B>(path: string, body: B, init?: RequestInit): Promise<T>; }

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload: unknown = await response.json().catch(() => undefined);
  if (!response.ok) { const data = typeof payload === "object" && payload !== null ? payload as Record<string, unknown> : {}; throw new HttpError({ status: response.status, code: typeof data.code === "string" ? data.code : undefined, message: typeof data.message === "string" ? data.message : "Request failed", details: data }); }
  return payload as T;
};

export const createHttpClient = (baseUrl: string): HttpClient => ({
  get: async <T>(path: string, init?: RequestInit) => parseResponse<T>(await fetch(`${baseUrl}${path}`, init)),
  post: async <T, B>(path: string, body: B, init?: RequestInit) => parseResponse<T>(await fetch(`${baseUrl}${path}`, { ...init, method: "POST", headers: { "content-type": "application/json", ...init?.headers }, body: JSON.stringify(body) })),
});
