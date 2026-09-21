import { z } from "zod";

export const userFilterSchema = z.object({
  query: z.string().trim().max(80).default(""),
  status: z.enum(["all", "active", "invited", "suspended"]).default("all"),
});

export const inviteUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  role: z.string().min(1),
});

export type UserFilter = z.infer<typeof userFilterSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
