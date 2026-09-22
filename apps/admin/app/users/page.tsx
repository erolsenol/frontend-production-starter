"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserStatus, UserSummary } from "@repo/contracts";
import type { SubmitState } from "@repo/forms";
import type { Notification } from "@repo/notifications";
import type { Paginated } from "@repo/types";
import { Button, Card, EmptyState } from "@repo/ui";
import { inviteUserSchema, userPageSchema, userSummarySchema } from "@repo/validators";

const pageSize = 4;
const roles = ["Administrator", "Developer", "Analyst", "Viewer"] as const;

interface InviteFormState {
  readonly name: string;
  readonly email: string;
  readonly role: string;
}

const initialInviteForm: InviteFormState = { name: "", email: "", role: "Developer" };
const emptyPage: Paginated<UserSummary> = { items: [], pageInfo: { page: 1, pageSize, total: 0, totalPages: 1 } };

const readErrorMessage = async (response: Response): Promise<string> => {
  const payload: unknown = await response.json().catch(() => undefined);
  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const error = payload.error;
    if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") return error.message;
  }
  return "Something went wrong. Please try again.";
};

export default function UsersPage() {
  const [userPage, setUserPage] = useState<Paginated<UserSummary>>(emptyPage);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState<InviteFormState>(initialInviteForm);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const [notification, setNotification] = useState<Notification | null>(null);

  const loadUsers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ query, status, page: String(page), pageSize: String(pageSize) });
    try {
      const response = await fetch(`/api/users?${params.toString()}`, { signal, cache: "no-store" });
      if (!response.ok) throw new Error(await readErrorMessage(response));
      const payload: unknown = await response.json();
      const result = userPageSchema.safeParse(payload);
      if (!result.success) throw new Error("The server returned an invalid users response.");
      setUserPage(result.data);
    } catch (cause: unknown) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setError(cause instanceof Error ? cause.message : "Unable to load users.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, query, status]);

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => loadUsers(controller.signal));
    return () => controller.abort();
  }, [loadUsers]);

  const openInvite = () => { setForm(initialInviteForm); setSubmitState({ status: "idle" }); setInviteOpen(true); };

  const submitInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = inviteUserSchema.safeParse(form);
    if (!result.success) {
      setSubmitState({ status: "error", message: result.error.issues[0]?.message ?? "Check the form fields." });
      return;
    }
    setSubmitState({ status: "submitting" });
    const response = await fetch("/api/users", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(result.data) });
    if (!response.ok) {
      setSubmitState({ status: "error", message: await readErrorMessage(response) });
      return;
    }
    const created: unknown = await response.json();
    const createdUser = userSummarySchema.safeParse(created);
    if (!createdUser.success) {
      setSubmitState({ status: "error", message: "The server returned an invalid user response." });
      return;
    }
    setInviteOpen(false);
    setSubmitState({ status: "success", message: "User invitation created." });
    setNotification({ id: createdUser.data.id, tone: "success", title: "Invitation created", description: `${createdUser.data.email} can now join the workspace.` });
    setPage(1);
    await loadUsers();
  };

  const deleteUser = async (user: UserSummary) => {
    if (!window.confirm(`Remove ${user.name}?`)) return;
    const response = await fetch(`/api/users/${encodeURIComponent(user.id)}`, { method: "DELETE" });
    if (!response.ok) {
      setNotification({ id: user.id, tone: "error", title: "User was not removed", description: await readErrorMessage(response) });
      return;
    }
    setNotification({ id: user.id, tone: "info", title: "User removed", description: `${user.name} was removed from this demo workspace.` });
    const nextPage = page > 1 && userPage.items.length === 1 ? page - 1 : page;
    setPage(nextPage);
    if (nextPage === page) await loadUsers();
  };

  const visibleUsers = userPage.items;
  const pageCount = userPage.pageInfo.totalPages;
  const range = useMemo(() => ({ start: userPage.pageInfo.total === 0 ? 0 : (page - 1) * pageSize + 1, end: Math.min(page * pageSize, userPage.pageInfo.total) }), [page, userPage.pageInfo.total]);

  return <div className="page-stack">
    {notification && <div className={`notification notification-${notification.tone}`} role="status"><strong>{notification.title}</strong><span>{notification.description}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotification(null)}>×</button></div>}
    <div className="page-heading"><div><h1>Users</h1><p>Manage access to your workspace.</p></div><Button className="invite-button" variant="primary" onClick={openInvite}>+ Invite user</Button></div>
    <Card className="list-card">
      <div className="filter-bar"><input type="search" className="filter-input" value={query} onChange={(event) => { setQuery(event.currentTarget.value); setPage(1); }} placeholder="Search users..." aria-label="Search users" /><select value={status} onChange={(event) => { setStatus(event.currentTarget.value as UserStatus | "all"); setPage(1); }} aria-label="Filter by status"><option value="all">All statuses</option><option value="active">Active</option><option value="invited">Invited</option><option value="suspended">Suspended</option></select></div>
      {isLoading ? <div className="empty-state" role="status" aria-busy="true"><h3>Loading users…</h3><p>Fetching the latest workspace members.</p></div> : error ? <div className="empty-state" role="alert"><h3>Unable to load users</h3><p>{error}</p><Button onClick={() => void loadUsers()}>Try again</Button></div> : visibleUsers.length === 0 ? <EmptyState title="No users found" description="Try changing your search or filters." /> : <div className="table-wrap"><table><thead><tr><th scope="col">User</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Last active</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleUsers.map((user) => <tr key={user.id}><td><span className="table-user"><span className="avatar small">{user.name.split(" ").map((part) => part[0]).join("")}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></span></td><td>{user.role}</td><td><span className={`status status-${user.status}`}>{user.status}</span></td><td>{user.lastActive}</td><td><button className="more-button" type="button" aria-label={`Delete ${user.name}`} onClick={() => void deleteUser(user)}>Delete</button></td></tr>)}</tbody></table></div>}
      {!isLoading && !error && userPage.pageInfo.total > 0 && <div className="pagination" aria-label="Users pagination"><span>Showing {range.start}–{range.end} of {userPage.pageInfo.total}</span><div><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span aria-label={`Page ${page} of ${pageCount}`}>{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>}
    </Card>
    {isInviteOpen && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="invite-user-title"><div className="modal-heading"><div><h2 id="invite-user-title">Invite user</h2><p>Add a teammate to this workspace.</p></div><button type="button" aria-label="Close invite dialog" onClick={() => setInviteOpen(false)}>×</button></div><form onSubmit={(event) => void submitInvite(event)}><label>Name<input required value={form.name} onChange={(event) => { const value = event.currentTarget.value; setForm((current) => ({ ...current, name: value })); }} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => { const value = event.currentTarget.value; setForm((current) => ({ ...current, email: value })); }} /></label><label>Role<select value={form.role} onChange={(event) => { const value = event.currentTarget.value; setForm((current) => ({ ...current, role: value })); }}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>{submitState.status === "error" && <p className="form-error" role="alert">{submitState.message}</p>}<div className="modal-actions"><Button type="button" onClick={() => setInviteOpen(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={submitState.status === "submitting"}>{submitState.status === "submitting" ? "Inviting…" : "Invite user"}</Button></div></form></section></div>}
  </div>;
}
