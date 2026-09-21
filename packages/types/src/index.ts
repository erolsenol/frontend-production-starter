export interface ApiErrorShape { readonly code: string; readonly message: string; readonly status: number; readonly details?: unknown; }
export interface PageInfo { readonly page: number; readonly pageSize: number; readonly total: number; readonly totalPages: number; }
export interface Paginated<T> { readonly items: readonly T[]; readonly pageInfo: PageInfo; }
export type AsyncState = "idle" | "loading" | "success" | "error";
