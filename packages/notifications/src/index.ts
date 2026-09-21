export type NotificationTone = "success" | "info" | "warning" | "error";
export interface Notification { readonly id: string; readonly tone: NotificationTone; readonly title: string; readonly description?: string; }
