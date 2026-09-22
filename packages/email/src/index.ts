export interface EmailMessage { readonly to: string; readonly from: string; readonly subject: string; readonly text: string; readonly html: string; }
export interface EmailSender { send(message: EmailMessage): Promise<void>; }
export const createWebhookEmailSender = (input: { readonly url: string; readonly token?: string }): EmailSender => ({
  async send(message) { const response = await fetch(input.url, { method: "POST", headers: { "content-type": "application/json", ...(input.token ? { authorization: `Bearer ${input.token}` } : {}) }, body: JSON.stringify(message) }); if (!response.ok) throw new Error(`Email webhook failed with status ${response.status}.`); },
});
export const createConsoleEmailSender = (write: (message: EmailMessage) => void = (message) => console.info("email.sent", { to: message.to, subject: message.subject })): EmailSender => ({ async send(message) { write(message); } });
export const createEmailSenderFromEnv = (env: Record<string, string | undefined>): EmailSender | null => env.EMAIL_WEBHOOK_URL ? createWebhookEmailSender({ url: env.EMAIL_WEBHOOK_URL, token: env.EMAIL_WEBHOOK_TOKEN }) : null;
