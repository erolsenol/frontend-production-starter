"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, Card } from "@repo/ui";
import type { Permission } from "@repo/permissions";
import type { RoleRecord } from "@repo/data-access";

interface RolesResponse { readonly items: readonly RoleRecord[]; readonly permissions: readonly Permission[]; }
type RoleDraft = { name: string; description: string; permissions: Permission[] };
const emptyDraft: RoleDraft = { name: "", description: "", permissions: ["dashboard.read"] };

export function RoleManager() {
  const [data, setData] = useState<RolesResponse | null>(null);
  const [draft, setDraft] = useState<RoleDraft>(emptyDraft);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch("/api/roles", { cache: "no-store" });
    if (!response.ok) throw new Error("Roles could not be loaded.");
    setData(await response.json() as RolesResponse);
  };

  useEffect(() => {
    let active = true;
    void fetch("/api/roles", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Roles could not be loaded.");
      return response.json() as Promise<RolesResponse>;
    }).then((nextData) => { if (active) setData(nextData); }).catch((loadError: unknown) => {
      if (active) setError(loadError instanceof Error ? loadError.message : "Roles could not be loaded.");
    });
    return () => { active = false; };
  }, []);

  const openCreate = () => { setEditingRole(null); setDraft(emptyDraft); setIsFormOpen(true); setError(null); };
  const openEdit = (role: RoleRecord) => { setEditingRole(role); setDraft({ name: role.name, description: role.description, permissions: [...role.permissions] }); setIsFormOpen(true); setError(null); };

  const saveRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const endpoint = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles";
    const response = await fetch(endpoint, { method: editingRole ? "PATCH" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
    if (!response.ok) { setError("Role could not be saved. Check the form and permissions."); return; }
    setEditingRole(null); setDraft(emptyDraft); setIsFormOpen(false); await load();
  };

  const removeRole = async (role: RoleRecord) => {
    if (role.system || !window.confirm(`Delete ${role.name}?`)) return;
    const response = await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
    if (!response.ok) { setError("Role could not be deleted."); return; }
    await load();
  };

  if (!data) return <div className="empty-state"><p>{error ?? "Loading roles…"}</p></div>;
  return <div className="page-stack">
    {error && <div className="notification"><strong>Unable to complete action.</strong><span>{error}</span></div>}
    <div className="page-heading"><div><h1>Roles</h1><p>Define what people can access in your workspace.</p></div><Button variant="primary" onClick={openCreate}>+ Create role</Button></div>
    <div className="role-grid">{data.items.map((role) => <Card key={role.id} className="role-card"><div className="role-top"><div className="role-icon">♢</div>{role.system && <span className="system-tag">System</span>}</div><h2>{role.name}</h2><p>{role.description}</p><div className="role-meta"><span>{role.members} members</span><span>{role.permissions.length} permissions</span></div><div className="role-actions"><Button size="sm" disabled={role.system} onClick={() => openEdit(role)}>Manage role</Button>{!role.system && <Button size="sm" variant="danger" onClick={() => void removeRole(role)}>Delete</Button>}</div></Card>)}</div>
    {isFormOpen && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="role-form-title"><div className="modal-heading"><div><h2 id="role-form-title">{editingRole ? "Manage role" : "Create role"}</h2><p>Grant only the access this role needs.</p></div><button type="button" aria-label="Close" onClick={() => { setEditingRole(null); setDraft(emptyDraft); setIsFormOpen(false); }}>×</button></div><form onSubmit={saveRole}><label>Name<input required minLength={2} maxLength={80} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label><label>Description<input required minLength={2} maxLength={200} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label><fieldset className="role-permission-grid"><legend>Permissions</legend>{data.permissions.map((permission) => <label key={permission}><input type="checkbox" checked={draft.permissions.includes(permission)} onChange={(event) => setDraft((current) => ({ ...current, permissions: event.target.checked ? [...current.permissions, permission] : current.permissions.filter((item) => item !== permission) }))} />{permission}</label>)}</fieldset><div className="modal-actions"><Button type="button" onClick={() => { setEditingRole(null); setDraft(emptyDraft); setIsFormOpen(false); }}>Cancel</Button><Button type="submit" variant="primary">{editingRole ? "Save changes" : "Create role"}</Button></div></form></section></div>}
  </div>;
}
