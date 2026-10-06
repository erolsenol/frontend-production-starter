import { describe, expect, it, vi } from "vitest";
import { createHttpClient } from "./index";

describe("createHttpClient", () => {
  it("normalizes URLs and parses successful responses", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const client = createHttpClient("https://api.example.com/", { fetch: request });

    await expect(client.get<{ ok: boolean }>("/health")).resolves.toEqual({ ok: true });
    expect(request).toHaveBeenCalledWith("https://api.example.com/health", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it("exposes structured errors for failed responses", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ code: "NOT_FOUND", message: "Missing" }), { status: 404 }));
    const client = createHttpClient("https://api.example.com", { fetch: request });

    await expect(client.get("/missing")).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });
  });

  it("reads nested API errors and supports patch/delete methods", async () => {
    const request = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: "FORBIDDEN", message: "Denied" } }), { status: 403 }));
    const client = createHttpClient("https://api.example.com", { fetch: request });

    await expect(client.patch<{ id: string }, { name: string }>("/users/1", { name: "Updated" })).resolves.toEqual({ id: "1" });
    await expect(client.delete("/users/1")).resolves.toBeUndefined();
    await expect(client.get("/users/1")).rejects.toMatchObject({ code: "FORBIDDEN", message: "Denied", status: 403 });
    expect(request.mock.calls.map(([url, init]) => [url, init?.method])).toEqual([
      ["https://api.example.com/users/1", "PATCH"],
      ["https://api.example.com/users/1", "DELETE"],
      ["https://api.example.com/users/1", undefined],
    ]);
  });

  it("combines caller cancellation with the client timeout signal", async () => {
    let requestInit: RequestInit | undefined;
    const request = vi.fn<typeof fetch>().mockImplementation(async (_input, init) => {
      requestInit = init;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    });
    const caller = new AbortController();
    const client = createHttpClient("https://api.example.com", { fetch: request });

    await client.get<{ ok: boolean }>("/health", { signal: caller.signal });
    expect(requestInit?.signal).not.toBe(caller.signal);
    expect(requestInit?.signal?.aborted).toBe(false);
    caller.abort();
    expect(requestInit?.signal?.aborted).toBe(false);
  });
});

describe("HTTP resource cleanup and headers", () => {
  it.each([new Headers({ authorization: "Bearer demo" }), [["authorization", "Bearer demo"]] as [string, string][], { authorization: "Bearer demo" }])("preserves every HeadersInit form", async (headers) => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response("{}"));
    const client = createHttpClient("https://api.example.com", { fetch: request });
    await client.post("/item", {}, { headers });
    const sent = new Headers(request.mock.calls[0]?.[1]?.headers);
    expect(sent.get("authorization")).toBe("Bearer demo");
    expect(sent.get("content-type")).toBe("application/json");
  });
  it("preserves an explicit content type", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response("{}"));
    await createHttpClient("https://api.example.com", { fetch: request }).patch("/item", {}, { headers: new Headers({ "content-type": "application/merge-patch+json" }) });
    expect(new Headers(request.mock.calls[0]?.[1]?.headers).get("content-type")).toBe("application/merge-patch+json");
  });
  it("cancels an in-flight request and disposes its timeout and caller listener", async () => {
    vi.useFakeTimers();
    const caller = new AbortController();
    const remove = vi.spyOn(caller.signal, "removeEventListener");
    const request = vi.fn<typeof fetch>().mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
    }));
    try {
      const result = createHttpClient("https://api.example.com", { fetch: request }).get("/slow", { signal: caller.signal });
      const assertion = expect(result).rejects.toMatchObject({ name: "AbortError" });
      caller.abort(); await assertion;
      expect(vi.getTimerCount()).toBe(0);
      expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
    } finally { vi.useRealTimers(); vi.restoreAllMocks(); }
  });
  it("disposes resources after a successful request or network failure", async () => {
    vi.useFakeTimers();
    try {
      const request = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response("{}"));
      const client = createHttpClient("https://api.example.com", { fetch: request });
      await client.get("/ok"); expect(vi.getTimerCount()).toBe(0);
      request.mockRejectedValueOnce(new Error("Offline"));
      await expect(client.get("/offline")).rejects.toThrow("Offline"); expect(vi.getTimerCount()).toBe(0);
    } finally { vi.useRealTimers(); }
  });
});
