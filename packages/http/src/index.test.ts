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
