"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@repo/ui";
import { Icon, type IconName } from "./icons";

const navigation: Array<{ label: string; href: string; icon: IconName }> = [
  { label: "Overview", href: "/", icon: "Home" },
  { label: "Users", href: "/users", icon: "Users" },
  { label: "Roles", href: "/roles", icon: "Shield" },
  { label: "Audit logs", href: "/audit-logs", icon: "FileText" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  return <div className={dark ? "app-shell theme-dark" : "app-shell"}>
    <aside className={mobileOpen ? "sidebar sidebar-open" : "sidebar"}>
      <div className="brand"><span className="brand-mark">F</span><span>Frontend<br /><strong>Production Starter</strong></span></div>
      <div className="workspace"><span className="workspace-avatar">A</span><span><strong>Acme Workspace</strong><small>Production</small></span><Icon name="ChevronDown" size={15} /></div>
      <nav className="nav-list" aria-label="Main navigation">
        {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={pathname === item.href ? "nav-item active" : "nav-item"}><Icon name={item.icon} /><span>{item.label}</span></Link>)}
      </nav>
      <div className="sidebar-footer"><div className="profile"><span className="avatar">JD</span><span><strong>Jordan Diaz</strong><small>jordan@acme.dev</small></span><Icon name="ChevronDown" size={15} /></div><button className="sign-out"><Icon name="Activity" />Sign out</button></div>
    </aside>
    {mobileOpen && <button className="backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <div className="main-column">
      <header className="topbar"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Icon name="Menu" /></button><div className="breadcrumbs"><span>Acme Workspace</span><span>/</span><strong>{navigation.find((item) => item.href === pathname)?.label ?? "Overview"}</strong></div><div className="topbar-actions"><label className="search"><Icon name="Search" size={17} /><input placeholder="Search..." aria-label="Search" /><kbd>⌘ K</kbd></label><button className="icon-button" aria-label="Notifications"><Icon name="Bell" /></button><button className="icon-button" aria-label="Toggle theme" onClick={() => setDark((value) => !value)}><Icon name={dark ? "Sun" : "Moon"} /></button></div></header>
      <main className="main-content">{children}</main>
    </div>
  </div>;
}
