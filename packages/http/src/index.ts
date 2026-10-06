import type { ApiErrorShape } from "@repo/types";

export class HttpError extends Error implements ApiErrorShape {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  constructor(input: { code?: string; message: string; status: number; details?: unknown }) { super(input.message); this.name = "HttpError"; this.code = input.code ?? "HTTP_ERROR"; this.status = input.status; this.details = input.details; }
}

export interface HttpClient {
  get<T>(path: string, init?: RequestInit): Promise<T>;
  post<T, B>(path: string, body: B, init?: RequestInit): Promise<T>;
  patch<T, B>(path: string, body: B, init?: RequestInit): Promise<T>;
  delete<T = void>(path: string, init?: RequestInit): Promise<T>;
}

export interface HttpClientOptions {
  readonly timeoutMs?: number;
  readonly fetch?: typeof globalThis.fetch;
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const data = typeof payload === "object" && payload !== null ? payload as Record<string, unknown> : {};
    const error = typeof data.error === "object" && data.error !== null ? data.error as Record<string, unknown> : data;
    throw new HttpError({ status: response.status, code: typeof error.code === "string" ? error.code : undefined, message: typeof error.message === "string" ? error.message : "Request failed", details: data });
  }
  return payload as T;
};

const joinUrl = (baseUrl: string, path: string): string =>
  `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

const withTimeout = (init: RequestInit | undefined, timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const callerSignal = init?.signal;
  const abortFromCaller = () => controller.abort(callerSignal?.reason);
  if (callerSignal?.aborted) abortFromCaller();
  else callerSignal?.addEventListener("abort", abortFromCaller, { once: true });
  const dispose = () => {
    clearTimeout(timeout);
    callerSignal?.removeEventListener("abort", abortFromCaller);
  };
  return { init: { ...init, signal: controller.signal }, dispose };
};

const jsonHeaders = (input: HeadersInit | undefined): Headers => {
  const headers = new Headers(input);
  if (!headers.has("content-type")) headers.set("content-type", "application/json");
  return headers;
};

export const createHttpClient = (baseUrl: string, options: HttpClientOptions = {}): HttpClient => {
  const request = options.fetch ?? globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? 10_000;

  const send = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const scoped = withTimeout(init, timeoutMs);
    try { return await parseResponse<T>(await request(joinUrl(baseUrl, path), scoped.init)); }
    finally { scoped.dispose(); }
  };

  return {
    get: <T>(path: string, init?: RequestInit) => send<T>(path, init),
    post: <T, B>(path: string, body: B, init?: RequestInit) => send<T>(path, {
      ...init, method: "POST", headers: jsonHeaders(init?.headers), body: JSON.stringify(body),
    }),
    patch: <T, B>(path: string, body: B, init?: RequestInit) => send<T>(path, {
      ...init, method: "PATCH", headers: jsonHeaders(init?.headers), body: JSON.stringify(body),
    }),
    delete: <T = void>(path: string, init?: RequestInit) => send<T>(path, { ...init, method: "DELETE" }),
  };
};
