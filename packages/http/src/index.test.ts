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
    caller.abort();
    expect(requestInit?.signal?.aborted).toBe(true);
  });
});
