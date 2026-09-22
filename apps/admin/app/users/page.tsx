"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserStatus, UserSummary } from "@repo/contracts";
import type { Notification } from "@repo/notifications";
import type { Paginated } from "@repo/types";
import { Button, Card, ConfirmDialog, EmptyState } from "@repo/ui";
import { listUsers, removeUser, updateUserStatus as updateUserStatusRequest } from "../../features/users/user-api";
import { InviteUserDialog } from "../../features/users/invite-user-dialog";
import { UserTable } from "../../features/users/user-table";

const pageSize = 4;
const emptyPage: Paginated<UserSummary> = { items: [], pageInfo: { page: 1, pageSize, total: 0, totalPages: 1 } };

export default function UsersPage() {
  const [userPage, setUserPage] = useState<Paginated<UserSummary>>(emptyPage);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserSummary | null>(null);

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

  const openInvite = () => setInviteOpen(true);

  const handleUserCreated = async (createdUser: UserSummary) => {
    setNotification({ id: createdUser.id, tone: "success", title: "Invitation created", description: `${createdUser.email} can now join the workspace.` });
    setPage(1);
    await loadUsers();
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
      {isLoading ? <div className="empty-state" role="status" aria-busy="true"><h3>Loading users…</h3><p>Fetching the latest workspace members.</p></div> : error ? <div className="empty-state" role="alert"><h3>Unable to load users</h3><p>{error}</p><Button onClick={() => void loadUsers()}>Try again</Button></div> : visibleUsers.length === 0 ? <EmptyState title="No users found" description="Try changing your search or filters." /> : <UserTable users={visibleUsers} onStatusChange={(user, nextStatus) => void updateUserStatus(user, nextStatus)} onDelete={requestDelete} />}
      {!isLoading && !error && userPage.pageInfo.total > 0 && <div className="pagination" aria-label="Users pagination"><span>Showing {range.start}–{range.end} of {userPage.pageInfo.total}</span><div><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span aria-label={`Page ${page} of ${pageCount}`}>{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>}
    </Card>
    <InviteUserDialog open={isInviteOpen} onClose={() => setInviteOpen(false)} onCreated={(user) => void handleUserCreated(user)} />
    <ConfirmDialog open={userToDelete !== null} title="Remove user" description={userToDelete ? `Remove ${userToDelete.name} from this workspace? This action cannot be undone.` : ""} confirmLabel="Remove user" onCancel={() => setUserToDelete(null)} onConfirm={() => { if (userToDelete) void deleteUser(userToDelete); setUserToDelete(null); }} />
  </div>;
}
