import { z } from "zod";
export const envSchema = z.object({ NEXT_PUBLIC_APP_NAME: z.string().optional(), NEXT_PUBLIC_API_URL: z.string().url().or(z.string().startsWith("/")).optional() });
export const paginationSchema = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) });
export type PaginationInput = z.infer<typeof paginationSchema>;
