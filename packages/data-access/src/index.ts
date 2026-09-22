import type { UserStatus, UserSummary } from "@repo/contracts";
import type { Paginated } from "@repo/types";
import { inviteUserSchema, paginationSchema, updateUserSchema, userFilterSchema } from "@repo/validators";
import type { UpdateUserInput } from "@repo/validators";
import type { Permission } from "@repo/permissions";
import { allPermissions } from "@repo/permissions";
import { createRoleSchema, updateRoleSchema } from "@repo/validators";

export type CreateUserInput = {
  readonly name: string;
  readonly email: string;
  readonly role: string;
};

export interface UserListInput {
  readonly query?: string;
  readonly status?: UserStatus | "all";
  readonly page?: number;
  readonly pageSize?: number;
}

export interface UserRepository {
  list(input?: UserListInput): Promise<Paginated<UserSummary>>;
  create(input: CreateUserInput): Promise<UserSummary>;
  update(id: string, input: UpdateUserInput): Promise<UserSummary | null>;
  remove(id: string): Promise<boolean>;
}

export class InMemoryUserRepository implements UserRepository {
  private readonly users: UserSummary[];
  private nextId: number;

  constructor(users: readonly UserSummary[]) {
    this.users = [...users];
    this.nextId = users.reduce((highest, user) => {
      const match = /^usr_(\d+)$/.exec(user.id);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0) + 1;
  }

  async list(input: UserListInput = {}): Promise<Paginated<UserSummary>> {
    const filter = userFilterSchema.parse({ query: input.query, status: input.status });
    const pagination = paginationSchema.parse({ page: input.page, pageSize: input.pageSize });
    const query = filter.query.toLowerCase();
    const filtered = this.users.filter(
      (user) =>
        (filter.status === "all" || user.status === filter.status) &&
        `${user.name} ${user.email}`.toLowerCase().includes(query),
    );
    const start = (pagination.page - 1) * pagination.pageSize;
    const items = filtered.slice(start, start + pagination.pageSize);

    return {
      items,
      pageInfo: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / pagination.pageSize)),
      },
    };
  }

  async create(input: CreateUserInput): Promise<UserSummary> {
    const user = inviteUserSchema.parse(input);
    const nextUser: UserSummary = {
      id: `usr_${String(this.nextId++).padStart(2, "0")}`,
      name: user.name,
      email: user.email,
      role: user.role,
      status: "invited",
      lastActive: "Not yet",
    };
    this.users.unshift(nextUser);
    return nextUser;
  }

  async remove(id: string): Promise<boolean> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index < 0) return false;
    this.users.splice(index, 1);
    return true;
  }

  async update(id: string, input: UpdateUserInput): Promise<UserSummary | null> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index < 0) return null;
    const update = updateUserSchema.parse(input);
    const updated = { ...this.users[index], ...update };
    this.users[index] = updated;
    return updated;
  }
}

export interface RoleRecord { readonly id: string; readonly name: string; readonly description: string; readonly permissions: readonly Permission[]; readonly members: number; readonly system: boolean; }
export type CreateRoleInput = { readonly name: string; readonly description: string; readonly permissions: readonly string[] };
export interface RoleRepository { list(): Promise<readonly RoleRecord[]>; create(input: CreateRoleInput): Promise<RoleRecord>; update(id: string, input: Partial<CreateRoleInput>): Promise<RoleRecord | null>; remove(id: string): Promise<boolean>; }

const normalizePermissions = (permissions: readonly string[]): Permission[] => permissions.filter((permission): permission is Permission => allPermissions.includes(permission as Permission));

export class InMemoryRoleRepository implements RoleRepository {
  private readonly roles: RoleRecord[];
  private nextId: number;
  constructor(roles: readonly RoleRecord[]) { this.roles = [...roles]; this.nextId = roles.length + 1; }
  async list(): Promise<readonly RoleRecord[]> { return [...this.roles]; }
  async create(input: CreateRoleInput): Promise<RoleRecord> {
    const parsed = createRoleSchema.parse(input);
    const permissions = normalizePermissions(parsed.permissions);
    if (permissions.length !== parsed.permissions.length) throw new Error("Unknown permission.");
    const role: RoleRecord = { id: `role_${String(this.nextId++).padStart(2, "0")}`, name: parsed.name, description: parsed.description, permissions, members: 0, system: false };
    this.roles.push(role);
    return role;
  }
  async update(id: string, input: Partial<CreateRoleInput>): Promise<RoleRecord | null> {
    const index = this.roles.findIndex((role) => role.id === id);
    if (index < 0 || this.roles[index].system) return null;
    const parsed = updateRoleSchema.parse(input);
    const permissions = parsed.permissions ? normalizePermissions(parsed.permissions) : this.roles[index].permissions;
    if (parsed.permissions && permissions.length !== parsed.permissions.length) throw new Error("Unknown permission.");
    const role = { ...this.roles[index], ...parsed, permissions };
    this.roles[index] = role;
    return role;
  }
  async remove(id: string): Promise<boolean> { const index = this.roles.findIndex((role) => role.id === id); if (index < 0 || this.roles[index].system) return false; this.roles.splice(index, 1); return true; }
}
