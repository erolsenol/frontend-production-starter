"use client";

import { useMemo, useState } from "react";
import type { UserStatus, UserSummary } from "@repo/contracts";
import type { SubmitState } from "@repo/forms";
import type { Notification } from "@repo/notifications";
import { Button, Card, EmptyState } from "@repo/ui";
import { inviteUserSchema } from "@repo/validators";
import { users as seedUsers } from "../../lib/mock-data";
import { filterUsers } from "../../lib/user-filters";

const pageSize = 4;
const roles = ["Administrator", "Developer", "Analyst", "Viewer"] as const;

interface InviteFormState {
  readonly name: string;
  readonly email: string;
  readonly role: string;
}

const initialInviteForm: InviteFormState = { name: "", email: "", role: "Developer" };

export default function UsersPage() {
  const [allUsers, setAllUsers] = useState<UserSummary[]>(() => [...seedUsers]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState<InviteFormState>(initialInviteForm);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const [notification, setNotification] = useState<Notification | null>(null);

  const filtered = useMemo(() => filterUsers(allUsers, { query, status }), [allUsers, query, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleUsers = filtered.slice((page - 1) * pageSize, page * pageSize);

  const updateQuery = (value: string) => { setQuery(value); setPage(1); };
  const updateStatus = (value: UserStatus | "all") => { setStatus(value); setPage(1); };
  const openInvite = () => { setForm(initialInviteForm); setSubmitState({ status: "idle" }); setInviteOpen(true); };

  const submitInvite = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = inviteUserSchema.safeParse(form);
    if (!result.success) {
      setSubmitState({ status: "error", message: result.error.issues[0]?.message ?? "Check the form fields." });
      return;
    }
    const nextUser: UserSummary = { id: `usr_${String(allUsers.length + 1).padStart(2, "0")}`, name: result.data.name, email: result.data.email, role: result.data.role, status: "invited", lastActive: "Not yet" };
    setAllUsers((current) => [nextUser, ...current]);
    setInviteOpen(false);
    setSubmitState({ status: "success", message: "User invitation created." });
    setNotification({ id: nextUser.id, tone: "success", title: "Invitation created", description: `${nextUser.email} can now join the workspace.` });
    setPage(1);
  };

  const deleteUser = (user: UserSummary) => {
    setAllUsers((current) => current.filter((candidate) => candidate.id !== user.id));
    setNotification({ id: user.id, tone: "info", title: "User removed", description: `${user.name} was removed from this demo workspace.` });
    setPage((current) => Math.min(current, Math.max(1, Math.ceil((filtered.length - 1) / pageSize))));
  };

  return <div className="page-stack">
    {notification && <div className={`notification notification-${notification.tone}`} role="status"><strong>{notification.title}</strong><span>{notification.description}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotification(null)}>×</button></div>}
    <div className="page-heading"><div><h1>Users</h1><p>Manage access to your workspace.</p></div><Button className="invite-button" variant="primary" onClick={openInvite}>+ Invite user</Button></div>
    <Card className="list-card">
      <div className="filter-bar"><input type="search" className="filter-input" value={query} onChange={(event) => updateQuery(event.currentTarget.value)} placeholder="Search users..." aria-label="Search users" /><select value={status} onChange={(event) => updateStatus(event.currentTarget.value as UserStatus | "all")} aria-label="Filter by status"><option value="all">All statuses</option><option value="active">Active</option><option value="invited">Invited</option><option value="suspended">Suspended</option></select></div>
      {visibleUsers.length === 0 ? <EmptyState title="No users found" description="Try changing your search or filters." /> : <div className="table-wrap"><table><thead><tr><th scope="col">User</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Last active</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleUsers.map((user) => <tr key={user.id}><td><span className="table-user"><span className="avatar small">{user.name.split(" ").map((part) => part[0]).join("")}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></span></td><td>{user.role}</td><td><span className={`status status-${user.status}`}>{user.status}</span></td><td>{user.lastActive}</td><td><button className="more-button" type="button" aria-label={`Delete ${user.name}`} onClick={() => deleteUser(user)}>Delete</button></td></tr>)}</tbody></table></div>}
      {filtered.length > 0 && <div className="pagination" aria-label="Users pagination"><span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span aria-label={`Page ${page} of ${pageCount}`}>{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>}
    </Card>
    {isInviteOpen && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="invite-user-title"><div className="modal-heading"><div><h2 id="invite-user-title">Invite user</h2><p>Add a teammate to this workspace.</p></div><button type="button" aria-label="Close invite dialog" onClick={() => setInviteOpen(false)}>×</button></div><form onSubmit={submitInvite}><label>Name<input required value={form.name} onChange={(event) => { const value = event.currentTarget.value; setForm((current) => ({ ...current, name: value })); }} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => { const value = event.currentTarget.value; setForm((current) => ({ ...current, email: value })); }} /></label><label>Role<select value={form.role} onChange={(event) => { const value = event.currentTarget.value; setForm((current) => ({ ...current, role: value })); }}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>{submitState.status === "error" && <p className="form-error" role="alert">{submitState.message}</p>}<div className="modal-actions"><Button type="button" onClick={() => setInviteOpen(false)}>Cancel</Button><Button type="submit" variant="primary">Invite user</Button></div></form></section></div>}
  </div>;
}
