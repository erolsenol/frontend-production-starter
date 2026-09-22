import { InMemoryAuditLogRepository, type AuditLogInput, type AuditLogRepository } from "@repo/data-access";
import { activities } from "./mock-data";

const demoEntries = activities.map((event) => ({ id: `audit_${event.id.padStart(4, "0")}`, actorId: null, action: event.action, resourceType: "activity", resourceId: event.id, metadata: { detail: event.detail }, ipAddress: event.ip, createdAt: new Date().toISOString() }));
const demoRepository = new InMemoryAuditLogRepository(demoEntries);
let configuredRepository: AuditLogRepository | null = null;
export const configureAuditRepository = (repository: AuditLogRepository | null): void => { configuredRepository = repository; };
export const getAuditRepository = (): AuditLogRepository => configuredRepository ?? demoRepository;
export const recordAudit = (input: AuditLogInput) => getAuditRepository().append(input);
export const recordRequestAudit = (request: Request, input: Omit<AuditLogInput, "ipAddress" | "userAgent" | "requestId"> & { readonly actorId: string | null; readonly requestId: string }) => recordAudit({ ...input, ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(), userAgent: request.headers.get("user-agent") ?? undefined });
