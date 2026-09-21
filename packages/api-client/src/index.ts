export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ApiClient {
  get<TResponse>(path: string): Promise<TResponse>;
  post<TResponse, TBody>(path: string, body: TBody): Promise<TResponse>;
}

export const createFetchClient = (baseUrl: string): ApiClient => ({
  async get<TResponse>(path: string) {
    const response = await fetch(`${baseUrl}${path}`);
    if (!response.ok) throw new ApiError("Request failed", response.status);
    return (await response.json()) as TResponse;
  },
  async post<TResponse, TBody>(path: string, body: TBody) {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new ApiError("Request failed", response.status);
    return (await response.json()) as TResponse;
  },
});
