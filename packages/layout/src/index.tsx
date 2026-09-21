import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1>{description ? <p>{description}</p> : null}</div>{actions}</div>;
}

export function ContentSection({ children }: { children: ReactNode }) { return <section className="page-stack">{children}</section>; }
