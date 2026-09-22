import { z } from "zod";

export { envSchema, paginationSchema } from "@repo/validation";

export const userFilterSchema = z.object({
  query: z.string().trim().max(80).default(""),
  status: z.enum(["all", "active", "invited", "suspended"]).default("all"),
});

export const userSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  status: z.enum(["active", "invited", "suspended"]),
  lastActive: z.string(),
});

export const userPageSchema = z.object({
  items: z.array(userSummarySchema),
  pageInfo: z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(1),
  }),
});

export const inviteUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  role: z.string().trim().min(1).max(80),
});

export type UserFilter = z.infer<typeof userFilterSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
