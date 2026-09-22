"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UserStatus, UserSummary } from "@repo/contracts";
import type { SubmitState } from "@repo/forms";
import type { Notification } from "@repo/notifications";
import type { Paginated } from "@repo/types";
import { Button, Card, ConfirmDialog, EmptyState } from "@repo/ui";
import { inviteUserSchema } from "@repo/validators";
import { createUser, listUsers, removeUser, updateUserStatus as updateUserStatusRequest } from "../../features/users/user-api";

const pageSize = 4;
const roles = ["Administrator", "Developer", "Analyst", "Viewer"] as const;

interface InviteFormState {
  readonly name: string;
  readonly email: string;
  readonly role: string;
}

const initialInviteForm: InviteFormState = { name: "", email: "", role: "Developer" };
const emptyPage: Paginated<UserSummary> = { items: [], pageInfo: { page: 1, pageSize, total: 0, totalPages: 1 } };

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
  const [userToDelete, setUserToDelete] = useState<UserSummary | null>(null);
  const closeInviteButtonRef = useRef<HTMLButtonElement>(null);

  const loadUsers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      setUserPage(await listUsers({ query, status, page, pageSize }, signal));
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

  useEffect(() => {
    if (!isInviteOpen) return;
    closeInviteButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInviteOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isInviteOpen]);

  const openInvite = () => { setForm(initialInviteForm); setSubmitState({ status: "idle" }); setInviteOpen(true); };

  const submitInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = inviteUserSchema.safeParse(form);
    if (!result.success) {
      setSubmitState({ status: "error", message: result.error.issues[0]?.message ?? "Check the form fields." });
      return;
    }
    setSubmitState({ status: "submitting" });
    try {
      const createdUser = await createUser(result.data);
      setInviteOpen(false);
      setSubmitState({ status: "success", message: "User invitation created." });
      setNotification({ id: createdUser.id, tone: "success", title: "Invitation created", description: `${createdUser.email} can now join the workspace.` });
      setPage(1);
      await loadUsers();
    } catch (cause: unknown) {
      setSubmitState({ status: "error", message: cause instanceof Error ? cause.message : "Unable to invite user." });
    }
  };

  const deleteUser = async (user: UserSummary) => {
    try {
      await removeUser(user.id);
    } catch (cause: unknown) {
      setNotification({ id: user.id, tone: "error", title: "User was not removed", description: cause instanceof Error ? cause.message : "Unable to remove user." });
      return;
    }
    setNotification({ id: user.id, tone: "info", title: "User removed", description: `${user.name} was removed from this demo workspace.` });
    const nextPage = page > 1 && userPage.items.length === 1 ? page - 1 : page;
    setPage(nextPage);
    if (nextPage === page) await loadUsers();
  };

  const updateUserStatus = async (user: UserSummary, nextStatus: UserStatus) => {
    try {
      await updateUserStatusRequest(user.id, nextStatus);
    } catch (cause: unknown) {
      setNotification({ id: user.id, tone: "error", title: "User was not updated", description: cause instanceof Error ? cause.message : "Unable to update user." });
      return;
    }
    setUserPage((current) => ({ ...current, items: current.items.map((candidate) => candidate.id === user.id ? { ...candidate, status: nextStatus } : candidate) }));
    setNotification({ id: user.id, tone: "success", title: "User updated", description: `${user.name} is now ${nextStatus}.` });
  };

  const requestDelete = (user: UserSummary) => setUserToDelete(user);

  const visibleUsers = userPage.items;
  const pageCount = userPage.pageInfo.totalPages;
  const range = useMemo(() => ({ start: userPage.pageInfo.total === 0 ? 0 : (page - 1) * pageSize + 1, end: Math.min(page * pageSize, userPage.pageInfo.total) }), [page, userPage.pageInfo.total]);

  return <div className="page-stack">
    {notification && <div className={`notification notification-${notification.tone}`} role="status"><strong>{notification.title}</strong><span>{notification.description}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotification(null)}>×</button></div>}
    <div className="page-heading"><div><h1>Users</h1><p>Manage access to your workspace.</p></div><Button className="invite-button" variant="primary" onClick={openInvite}>+ Invite user</Button></div>
    <Card className="list-card">
      <div className="filter-bar"><input type="search" className="filter-input" value={query} onChange={(event) => { setQuery(event.currentTarget.value); setPage(1); }} placeholder="Search users..." aria-label="Search users" /><select value={status} onChange={(event) => { setStatus(event.currentTarget.value as UserStatus | "all"); setPage(1); }} aria-label="Filter by status"><option value="all">All statuses</option><option value="active">Active</option><option value="invited">Invited</option><option value="suspended">Suspended</option></select></div>
      {isLoading ? <div className="empty-state" role="status" aria-busy="true"><h3>Loading users…</h3><p>Fetching the latest workspace members.</p></div> : error ? <div className="empty-state" role="alert"><h3>Unable to load users</h3><p>{error}</p><Button onClick={() => void loadUsers()}>Try again</Button></div> : visibleUsers.length === 0 ? <EmptyState title="No users found" description="Try changing your search or filters." /> : <div className="table-wrap"><table><thead><tr><th scope="col">User</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Last active</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead><tbody>{visibleUsers.map((user) => <tr key={user.id}><td><span className="table-user"><span className="avatar small">{user.name.split(" ").map((part) => part[0]).join("")}</span><span><strong>{user.name}</strong><small>{user.email}</small></span></span></td><td>{user.role}</td><td><select className="user-status-select" aria-label={`Update status for ${user.name}`} value={user.status} onChange={(event) => void updateUserStatus(user, event.currentTarget.value as UserStatus)}><option value="active">Active</option><option value="invited">Invited</option><option value="suspended">Suspended</option></select></td><td>{user.lastActive}</td><td><button className="more-button" type="button" aria-label={`Delete ${user.name}`} onClick={() => requestDelete(user)}>Delete</button></td></tr>)}</tbody></table></div>}
      {!isLoading && !error && userPage.pageInfo.total > 0 && <div className="pagination" aria-label="Users pagination"><span>Showing {range.start}–{range.end} of {userPage.pageInfo.total}</span><div><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span aria-label={`Page ${page} of ${pageCount}`}>{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>}
    </Card>
    {isInviteOpen && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="invite-user-title" aria-describedby="invite-user-description"><div className="modal-heading"><div><h2 id="invite-user-title">Invite user</h2><p id="invite-user-description">Add a teammate to this workspace.</p></div><button ref={closeInviteButtonRef} type="button" aria-label="Close invite dialog" onClick={() => setInviteOpen(false)}>×</button></div><form onSubmit={(event) => void submitInvite(event)}><label>Name<input required value={form.name} onChange={(event) => { const value = event.currentTarget.value; setForm((current) => ({ ...current, name: value })); }} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => { const value = event.currentTarget.value; setForm((current) => ({ ...current, email: value })); }} /></label><label>Role<select value={form.role} onChange={(event) => { const value = event.currentTarget.value; setForm((current) => ({ ...current, role: value })); }}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>{submitState.status === "error" && <p className="form-error" role="alert">{submitState.message}</p>}<div className="modal-actions"><Button type="button" onClick={() => setInviteOpen(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={submitState.status === "submitting"}>{submitState.status === "submitting" ? "Inviting…" : "Invite user"}</Button></div></form></section></div>}
    <ConfirmDialog open={userToDelete !== null} title="Remove user" description={userToDelete ? `Remove ${userToDelete.name} from this workspace? This action cannot be undone.` : ""} confirmLabel="Remove user" onCancel={() => setUserToDelete(null)} onConfirm={() => { if (userToDelete) void deleteUser(userToDelete); setUserToDelete(null); }} />
  </div>;
}
