export interface TableColumn<T> { readonly id: string; readonly header: string; readonly accessor?: keyof T; readonly sortable?: boolean; }
export interface TableState { readonly page: number; readonly pageSize: number; readonly query: string; readonly sort?: string; readonly direction?: "asc" | "desc"; }
