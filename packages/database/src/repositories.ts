import { randomUUID } from "node:crypto";
import { and, countDistinct, desc, eq, ilike, or } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { Permission } from "@repo/permissions";
import { allPermissions } from "@repo/permissions";
import type { AuditLogRecord, AuditLogRepository, RoleRecord, RoleRepository, UserRepository } from "@repo/data-access";
import { createRoleSchema, inviteUserSchema, paginationSchema, updateRoleSchema, updateUserSchema, userFilterSchema } from "@repo/validators";
import type { CreateRoleInput, UpdateRoleInput } from "@repo/validators";
import type { UserStatus, UserSummary } from "@repo/contracts";
import type * as schema from "./schema";
import { auditLogs, authUser, permissions, rolePermissions, roles, userProfiles, userRoles } from "./schema";

type Database = NeonHttpDatabase<typeof schema>;
const validStatus = (value: string): UserStatus => value === "active" || value === "suspended" ? value : "invited";
const validPermissions = (values: readonly string[]): Permission[] => values.filter((value): value is Permission => allPermissions.includes(value as Permission));
const parseMetadata = (value: string): Readonly<Record<string, string>> | undefined => {
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return undefined;
    return Object.fromEntries(Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  } catch {
    return undefined;
  }
};

export const createDrizzleUserRepository = (db: Database): UserRepository => ({
  async list(input = {}) {
    const filter = userFilterSchema.parse({ query: input.query, status: input.status });
    const pagination = paginationSchema.parse({ page: input.page, pageSize: input.pageSize });
    const textFilter = filter.query ? or(ilike(authUser.name, `%${filter.query}%`), ilike(authUser.email, `%${filter.query}%`)) : undefined;
    const statusFilter = filter.status === "all" ? undefined : eq(userProfiles.status, filter.status);
    const where = textFilter && statusFilter ? and(textFilter, statusFilter) : textFilter ?? statusFilter;
    const [rows, totalRows] = await Promise.all([
      db.select({ id: authUser.id, name: authUser.name, email: authUser.email, profileRole: userProfiles.role, role: roles.name, status: userProfiles.status, lastActive: userProfiles.lastActive }).from(authUser).leftJoin(userProfiles, eq(userProfiles.userId, authUser.id)).leftJoin(userRoles, eq(userRoles.userId, authUser.id)).leftJoin(roles, eq(roles.id, userRoles.roleId)).where(where).orderBy(desc(authUser.createdAt)).limit(pagination.pageSize).offset((pagination.page - 1) * pagination.pageSize),
      db.select({ total: countDistinct(authUser.id) }).from(authUser).leftJoin(userProfiles, eq(userProfiles.userId, authUser.id)).where(where),
    ]);
    const items = rows.map((row): UserSummary => ({ id: row.id, name: row.name, email: row.email, role: row.role ?? row.profileRole ?? "Viewer", status: validStatus(row.status ?? "invited"), lastActive: row.lastActive ?? "Not yet" }));
    const total = Number(totalRows[0]?.total ?? 0);
    return { items, pageInfo: { page: pagination.page, pageSize: pagination.pageSize, total, totalPages: Math.max(1, Math.ceil(total / pagination.pageSize)) } };
  },
  async create(input) { const parsed = inviteUserSchema.parse(input); const id = randomUUID(); return db.transaction(async (tx) => { await tx.insert(authUser).values({ id, name: parsed.name, email: parsed.email }); await tx.insert(userProfiles).values({ userId: id, role: parsed.role, status: "invited", lastActive: "Not yet" }); const role = await tx.select({ id: roles.id }).from(roles).where(eq(roles.name, parsed.role)); if (role[0]) await tx.insert(userRoles).values({ userId: id, roleId: role[0].id }); return { id, name: parsed.name, email: parsed.email, role: parsed.role, status: "invited", lastActive: "Not yet" }; }); },
  async update(id, input) { const parsed = updateUserSchema.parse(input); return db.transaction(async (tx) => { const current = await tx.select({ id: authUser.id, name: authUser.name, email: authUser.email, profileRole: userProfiles.role, role: roles.name, status: userProfiles.status, lastActive: userProfiles.lastActive }).from(authUser).leftJoin(userProfiles, eq(userProfiles.userId, authUser.id)).leftJoin(userRoles, eq(userRoles.userId, authUser.id)).leftJoin(roles, eq(roles.id, userRoles.roleId)).where(eq(authUser.id, id)); if (!current[0]) return null; if (parsed.name) await tx.update(authUser).set({ name: parsed.name, updatedAt: new Date() }).where(eq(authUser.id, id)); const profileUpdate = { ...(parsed.role ? { role: parsed.role } : {}), ...(parsed.status ? { status: parsed.status } : {}) }; if (Object.keys(profileUpdate).length > 0) await tx.update(userProfiles).set(profileUpdate).where(eq(userProfiles.userId, id)); if (parsed.role) { const role = await tx.select({ id: roles.id }).from(roles).where(eq(roles.name, parsed.role)); await tx.delete(userRoles).where(eq(userRoles.userId, id)); if (role[0]) await tx.insert(userRoles).values({ userId: id, roleId: role[0].id }); } const row = current[0]; return { id, name: parsed.name ?? row.name, email: row.email, role: parsed.role ?? row.role ?? row.profileRole ?? "Viewer", status: validStatus(parsed.status ?? row.status ?? "invited"), lastActive: row.lastActive ?? "Not yet" }; }); },
  async remove(id) { const deleted = await db.delete(authUser).where(eq(authUser.id, id)).returning({ id: authUser.id }); return deleted.length > 0; },
});

export const createDrizzlePermissionResolver = (db: Database) => async (userId: string): Promise<readonly Permission[]> => {
  const rows = await db.select({ key: permissions.key })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, userRoles.roleId))
    .innerJoin(permissions, eq(permissions.key, rolePermissions.permissionKey))
    .where(eq(userRoles.userId, userId));
  return [...new Set(rows.flatMap((row) => allPermissions.includes(row.key as Permission) ? [row.key as Permission] : []))];
};

export const createDrizzleRoleRepository = (db: Database): RoleRepository => ({
  async list() { const roleRows = await db.select().from(roles); const permissionRows = await db.select({ roleId: rolePermissions.roleId, key: permissions.key }).from(rolePermissions).innerJoin(permissions, eq(permissions.key, rolePermissions.permissionKey)); const memberRows = await db.select({ roleId: userRoles.roleId }).from(userRoles); const counts = new Map<string, Permission[]>(); for (const row of permissionRows) { const list = counts.get(row.roleId) ?? []; if (allPermissions.includes(row.key as Permission)) list.push(row.key as Permission); counts.set(row.roleId, list); } const members = new Map<string, number>(); for (const row of memberRows) members.set(row.roleId, (members.get(row.roleId) ?? 0) + 1); return roleRows.map((role): RoleRecord => ({ id: role.id, name: role.name, description: role.description, system: role.system, members: members.get(role.id) ?? 0, permissions: counts.get(role.id) ?? [] })); },
  async create(input: CreateRoleInput) { const parsed = createRoleSchema.parse(input); const normalized = validPermissions(parsed.permissions); if (normalized.length !== parsed.permissions.length) throw new Error("Unknown permission."); const id = randomUUID(); return db.transaction(async (tx) => { await tx.insert(roles).values({ id, name: parsed.name, description: parsed.description, system: false }); if (normalized.length > 0) await tx.insert(rolePermissions).values(normalized.map((permissionKey) => ({ roleId: id, permissionKey }))); return { id, name: parsed.name, description: parsed.description, system: false, members: 0, permissions: normalized }; }); },
  async update(id: string, input: UpdateRoleInput) { const parsed = updateRoleSchema.parse(input); return db.transaction(async (tx) => { const current = await tx.select().from(roles).where(eq(roles.id, id)); if (!current[0] || current[0].system) return null; const normalized = parsed.permissions ? validPermissions(parsed.permissions) : null; if (parsed.permissions && normalized && normalized.length !== parsed.permissions.length) throw new Error("Unknown permission."); const existingPermissions = normalized ?? (await tx.select({ key: permissions.key }).from(rolePermissions).innerJoin(permissions, eq(permissions.key, rolePermissions.permissionKey)).where(eq(rolePermissions.roleId, id))).flatMap((row) => allPermissions.includes(row.key as Permission) ? [row.key as Permission] : []); await tx.update(roles).set({ ...(parsed.name ? { name: parsed.name } : {}), ...(parsed.description ? { description: parsed.description } : {}), updatedAt: new Date() }).where(eq(roles.id, id)); if (normalized) { await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, id)); if (normalized.length > 0) await tx.insert(rolePermissions).values(normalized.map((permissionKey) => ({ roleId: id, permissionKey }))); } return { id, name: parsed.name ?? current[0].name, description: parsed.description ?? current[0].description, system: false, members: 0, permissions: existingPermissions }; }); },
  async remove(id) { const current = await db.select({ system: roles.system }).from(roles).where(and(eq(roles.id, id), eq(roles.system, false))); if (!current[0]) return false; const deleted = await db.delete(roles).where(eq(roles.id, id)).returning({ id: roles.id }); return deleted.length > 0; },
});

export const createDrizzleAuditRepository = (db: Database): AuditLogRepository => ({
  async list(input = {}) { const page = input.page ?? 1; const pageSize = input.pageSize ?? 20; const [rows, totalRows] = await Promise.all([db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(pageSize).offset((page - 1) * pageSize), db.select({ total: countDistinct(auditLogs.id) }).from(auditLogs)]); const total = Number(totalRows[0]?.total ?? 0); return { items: rows.map((row): AuditLogRecord => ({ id: row.id, actorId: row.actorId, action: row.action, resourceType: row.resourceType, resourceId: row.resourceId ?? undefined, metadata: row.metadata ? parseMetadata(row.metadata) : undefined, ipAddress: row.ipAddress ?? undefined, userAgent: row.userAgent ?? undefined, requestId: row.requestId ?? undefined, createdAt: row.createdAt.toISOString() })), pageInfo: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } }; },
  async append(input) { const id = randomUUID(); const createdAt = new Date(); await db.insert(auditLogs).values({ id, actorId: input.actorId, action: input.action, resourceType: input.resourceType, resourceId: input.resourceId, metadata: input.metadata ? JSON.stringify(input.metadata) : undefined, ipAddress: input.ipAddress, userAgent: input.userAgent, requestId: input.requestId, createdAt }); return { ...input, id, createdAt: createdAt.toISOString() }; },
});
