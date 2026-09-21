import type { UserStatus, UserSummary } from "@repo/contracts";
import type { Paginated } from "@repo/types";
import { paginationSchema, userFilterSchema } from "@repo/validators";

export interface UserListInput {
  readonly query?: string;
  readonly status?: UserStatus | "all";
  readonly page?: number;
  readonly pageSize?: number;
}

export interface UserRepository {
  list(input?: UserListInput): Promise<Paginated<UserSummary>>;
}

export class InMemoryUserRepository implements UserRepository {
  private readonly users: readonly UserSummary[];

  constructor(users: readonly UserSummary[]) {
    this.users = users;
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
}
