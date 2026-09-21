import type { UserFilter } from "@repo/validators";
import { userFilterSchema } from "@repo/validators";
import type { UserSummary } from "@repo/contracts";

export const filterUsers = (users: readonly UserSummary[], input: UserFilter): readonly UserSummary[] => {
  const filter = userFilterSchema.parse(input);
  const query = filter.query.toLowerCase();

  return users.filter(
    (user) =>
      (filter.status === "all" || user.status === filter.status) &&
      `${user.name} ${user.email}`.toLowerCase().includes(query),
  );
};
