import type { ActivityEvent, RoleSummary, UserSummary } from "@repo/contracts";

export const activities: readonly ActivityEvent[] = [
  { id: "1", actor: "Sarah Lee", action: "User login", detail: "Successful login", timestamp: "Apr 30, 2024 · 2:14 PM", ip: "203.0.113.24" },
  { id: "2", actor: "Marcus Kim", action: "Updated settings", detail: "Changed notification preferences", timestamp: "Apr 30, 2024 · 1:03 PM", ip: "198.51.100.17" },
  { id: "3", actor: "Daniel Torres", action: "Created role", detail: "Added role Developer", timestamp: "Apr 30, 2024 · 11:47 AM", ip: "192.0.2.56" },
  { id: "4", actor: "Emily Park", action: "Invited user", detail: "Invited alex@acme.dev", timestamp: "Apr 30, 2024 · 9:21 AM", ip: "203.0.113.91" },
  { id: "5", actor: "James Rivera", action: "Deleted user", detail: "Removed user account", timestamp: "Apr 29, 2024 · 6:18 PM", ip: "198.51.100.73" },
];

export const users: UserSummary[] = [
  { id: "usr_01", name: "Sarah Lee", email: "sarah@acme.dev", role: "Administrator", status: "active", lastActive: "2 minutes ago" },
  { id: "usr_02", name: "Marcus Kim", email: "marcus@acme.dev", role: "Developer", status: "active", lastActive: "18 minutes ago" },
  { id: "usr_03", name: "Daniel Torres", email: "daniel@acme.dev", role: "Developer", status: "invited", lastActive: "Not yet" },
  { id: "usr_04", name: "Emily Park", email: "emily@acme.dev", role: "Analyst", status: "active", lastActive: "1 hour ago" },
  { id: "usr_05", name: "James Rivera", email: "james@acme.dev", role: "Viewer", status: "suspended", lastActive: "3 days ago" },
];

export const roles: readonly RoleSummary[] = [
  { id: "role_01", name: "Administrator", description: "Full access to the workspace", members: 2, permissions: 18, system: true },
  { id: "role_02", name: "Developer", description: "Product and integration access", members: 12, permissions: 11, system: false },
  { id: "role_03", name: "Analyst", description: "Reports and audit visibility", members: 8, permissions: 6, system: false },
  { id: "role_04", name: "Viewer", description: "Read-only workspace access", members: 16, permissions: 3, system: true },
];
