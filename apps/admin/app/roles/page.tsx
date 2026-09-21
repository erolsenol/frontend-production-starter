import { Button, Card } from "@repo/ui";
import { roles } from "../../lib/mock-data";

export default function RolesPage() { return <div className="page-stack"><div className="page-heading"><div><h1>Roles</h1><p>Define what people can access in your workspace.</p></div><Button variant="primary">+ Create role</Button></div><div className="role-grid">{roles.map((role) => <Card key={role.id} className="role-card"><div className="role-top"><div className="role-icon">♢</div>{role.system && <span className="system-tag">System</span>}</div><h2>{role.name}</h2><p>{role.description}</p><div className="role-meta"><span>{role.members} members</span><span>{role.permissions} permissions</span></div><Button size="sm">Manage role</Button></Card>)}</div></div>; }
