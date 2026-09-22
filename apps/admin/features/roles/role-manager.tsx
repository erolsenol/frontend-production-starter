"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button, Card } from "@repo/ui";
import type { Permission } from "@repo/permissions";
import type { RoleRecord } from "@repo/data-access";

interface RolesResponse { readonly items: readonly RoleRecord[]; readonly permissions: readonly Permission[]; }

export function RoleManager() {
  const [data, setData] = useState<RolesResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(["dashboard.read"]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => { const response = await fetch("/api/roles", { cache: "no-store" }); if (!response.ok) throw new Error("Roles could not be loaded."); const nextData = await response.json() as RolesResponse; setData(nextData); };
  useEffect(() => {
    let active = true;
    void fetch("/api/roles", { cache: "no-store" }).then(async (response) => { if (!response.ok) throw new Error("Roles could not be loaded."); return response.json() as Promise<RolesResponse>; }).then((nextData) => { if (active) setData(nextData); }).catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Roles could not be loaded."); });
    return () => { active = false; };
  }, []);

  const createRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/roles", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, description, permissions: selectedPermissions }) });
    if (!response.ok) { setError("Role could not be created. Check the form and permissions."); return; }
    setName(""); setDescription(""); setSelectedPermissions(["dashboard.read"]); setIsCreating(false); await load();
  };

  if (!data) return <div className="empty-state"><p>{error ?? "Loading roles…"}</p></div>;
  return <div className="page-stack">
    {error && <div className="notification"><strong>Unable to complete action.</strong><span>{error}</span></div>}
    <div className="page-heading"><div><h1>Roles</h1><p>Define what people can access in your workspace.</p></div><Button variant="primary" onClick={() => setIsCreating(true)}>+ Create role</Button></div>
    <div className="role-grid">{data.items.map((role) => <Card key={role.id} className="role-card"><div className="role-top"><div className="role-icon">♢</div>{role.system && <span className="system-tag">System</span>}</div><h2>{role.name}</h2><p>{role.description}</p><div className="role-meta"><span>{role.members} members</span><span>{role.permissions.length} permissions</span></div><Button size="sm" disabled={role.system}>Manage role</Button></Card>)}</div>
    {isCreating && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-role-title"><div className="modal-heading"><div><h2 id="create-role-title">Create role</h2><p>Grant only the access this role needs.</p></div><button type="button" aria-label="Close" onClick={() => setIsCreating(false)}>×</button></div><form onSubmit={createRole}><label>Name<input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></label><label>Description<input required minLength={2} maxLength={200} value={description} onChange={(event) => setDescription(event.target.value)} /></label><fieldset className="role-permission-grid"><legend>Permissions</legend>{data.permissions.map((permission) => <label key={permission}><input type="checkbox" checked={selectedPermissions.includes(permission)} onChange={(event) => setSelectedPermissions((current) => event.target.checked ? [...current, permission] : current.filter((item) => item !== permission))} />{permission}</label>)}</fieldset><div className="modal-actions"><Button type="button" onClick={() => setIsCreating(false)}>Cancel</Button><Button type="submit" variant="primary">Create role</Button></div></form></section></div>}
  </div>;
}
