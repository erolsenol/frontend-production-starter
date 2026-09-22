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

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  role: z.string().trim().min(1).max(80).optional(),
  status: z.enum(["active", "invited", "suspended"]).optional(),
}).refine((input) => Object.keys(input).length > 0, "At least one user field is required.");

export const createRoleSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(2).max(200),
  permissions: z.array(z.string().min(1)).min(1).max(50),
});

export const updateRoleSchema = createRoleSchema.partial().refine((input) => Object.keys(input).length > 0, "At least one role field is required.");

export type UserFilter = z.infer<typeof userFilterSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
