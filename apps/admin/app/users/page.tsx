"use client";

import { useMemo, useState } from "react";
import { Button, Card, EmptyState } from "@repo/ui";
import type { UserStatus } from "@repo/contracts";
import { users } from "../../lib/mock-data";

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const filtered = useMemo(() => users.filter((user) => (status === "all" || user.status === status) && `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())), [query, status]);
  return <div className="page-stack"><div className="page-heading"><div><h1>Users</h1><p>Manage access to your workspace.</p></div><Button className="invite-button" variant="primary">+ Invite user</Button></div><Card className="list-card"><div className="filter-bar"><input className="filter-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users..." aria-label="Search users" /><select value={status} onChange={(event) => setStatus(event.target.value as UserStatus | "all")} aria-label="Filter by status"><option value="all">All statuses</option><option value="active">Active</option><option value="invited">Invited</option><option value="suspended">Suspended</option></select></div>{filtered.length === 0 ? <EmptyState title="No users found" description="Try changing your search or filters." /> : <div className="table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last active</th><th /></tr></thead><tbody>{filtered.map((user) => <tr key={user.id}><td><span className="table-user"><span className="avatar small">{user.name.split(" ").map((part) => part[0]).join("")}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></span></td><td>{user.role}</td><td><span className={`status status-${user.status}`}>{user.status}</span></td><td>{user.lastActive}</td><td><button className="more-button" aria-label={`More actions for ${user.name}`}>•••</button></td></tr>)}</tbody></table></div>}</Card></div>;
}
