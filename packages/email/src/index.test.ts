import { describe, expect, it, vi } from "vitest";
import { createEmailSenderFromEnv } from "./index";
describe("email sender", () => {
  it("does not enable delivery without an explicit webhook", () => { expect(createEmailSenderFromEnv({})).toBeNull(); });
  it("sends a typed message through the configured webhook", async () => { const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 202 })); vi.stubGlobal("fetch", fetchMock); const sender = createEmailSenderFromEnv({ EMAIL_WEBHOOK_URL: "https://mail.example.test/send", EMAIL_WEBHOOK_TOKEN: "secret" }); await sender?.send({ to: "user@example.com", from: "noreply@example.com", subject: "Test", text: "Test", html: "<p>Test</p>" }); expect(fetchMock).toHaveBeenCalledWith("https://mail.example.test/send", expect.objectContaining({ method: "POST" })); vi.unstubAllGlobals(); });
});
