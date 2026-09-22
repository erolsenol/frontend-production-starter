import type { UserStatus, UserSummary } from "@repo/contracts";
import type { Paginated } from "@repo/types";
import { inviteUserSchema, paginationSchema, userFilterSchema } from "@repo/validators";

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
  remove(id: string): Promise<boolean>;
}

export class InMemoryUserRepository implements UserRepository {
  private readonly users: UserSummary[];

  constructor(users: readonly UserSummary[]) {
    this.users = [...users];
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
      id: `usr_${String(this.users.length + 1).padStart(2, "0")}`,
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
}
