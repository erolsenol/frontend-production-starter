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

const withTimeout = (init: RequestInit | undefined, timeoutMs: number): RequestInit => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const callerSignal = init?.signal;
  const abortFromCaller = () => controller.abort(callerSignal?.reason);
  if (callerSignal?.aborted) abortFromCaller();
  else callerSignal?.addEventListener("abort", abortFromCaller, { once: true });
  controller.signal.addEventListener("abort", () => {
    clearTimeout(timeout);
    callerSignal?.removeEventListener("abort", abortFromCaller);
  }, { once: true });
  return { ...init, signal: controller.signal };
};

export const createHttpClient = (baseUrl: string, options: HttpClientOptions = {}): HttpClient => {
  const request = options.fetch ?? globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? 10_000;

  return {
    get: async <T>(path: string, init?: RequestInit) =>
      parseResponse<T>(await request(joinUrl(baseUrl, path), withTimeout(init, timeoutMs))),
    post: async <T, B>(path: string, body: B, init?: RequestInit) =>
      parseResponse<T>(
        await request(
          joinUrl(baseUrl, path),
          withTimeout({
            ...init,
            method: "POST",
            headers: { "content-type": "application/json", ...init?.headers },
            body: JSON.stringify(body),
          }, timeoutMs),
        ),
      ),
    patch: async <T, B>(path: string, body: B, init?: RequestInit) =>
      parseResponse<T>(
        await request(
          joinUrl(baseUrl, path),
          withTimeout({ ...init, method: "PATCH", headers: { "content-type": "application/json", ...init?.headers }, body: JSON.stringify(body) }, timeoutMs),
        ),
      ),
    delete: async <T = void>(path: string, init?: RequestInit) =>
      parseResponse<T>(await request(joinUrl(baseUrl, path), withTimeout({ ...init, method: "DELETE" }, timeoutMs))),
  };
};
