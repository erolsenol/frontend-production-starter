import { Activity, ArrowUpRight, CheckCircle2, ShieldCheck, UserPlus, Users } from "lucide-react";
import { Button, Card } from "@repo/ui";
import { activities } from "../lib/mock-data";

const metrics = [
  { label: "Total users", value: "1,284", change: "12%", icon: Users },
  { label: "Active sessions", value: "342", change: "8%", icon: Activity },
  { label: "New signups", value: "86", change: "24%", icon: UserPlus },
  { label: "System health", value: "99.9%", change: "All systems operational", icon: ShieldCheck },
];

export default function DashboardPage() {
  return <div className="page-stack">
    <div className="page-heading"><div><h1>Overview</h1><p>A quick snapshot of your workspace activity and system status.</p></div><Button><span>Apr 1, 2024 – Apr 30, 2024</span>⌄</Button></div>
    <section className="metric-grid">{metrics.map(({ label, value, change, icon: MetricIcon }) => <Card key={label} className="metric-card"><div className="metric-icon"><MetricIcon size={20} /></div><div><span className="eyebrow">{label}</span><strong className="metric-value">{value}</strong>{label === "System health" ? <span className="metric-status"><i />{change}</span> : <span className="metric-change">↑ {change} <em>vs. previous month</em></span>}</div></Card>)}</section>
    <section className="chart-grid"><Card className="chart-card"><div className="card-heading"><div><h2>User growth</h2><p>Total users in your workspace over time.</p></div><Button size="sm">Last 30 days <span>⌄</span></Button></div><div className="area-chart"><div className="chart-y"><span>1,400</span><span>1,000</span><span>600</span><span>200</span><span>0</span></div><div className="chart-plot"><div className="grid-lines" /><svg viewBox="0 0 720 220" preserveAspectRatio="none" role="img" aria-label="User growth chart"><path d="M0 180 C70 155 105 160 150 145 S245 142 290 135 S365 125 420 105 S490 120 530 100 S615 55 720 45 L720 220 L0 220 Z" fill="rgba(91,124,250,.12)" /><path d="M0 180 C70 155 105 160 150 145 S245 142 290 135 S365 125 420 105 S490 120 530 100 S615 55 720 45" fill="none" stroke="#5b7cfa" strokeWidth="3" /></svg><div className="chart-x"><span>Apr 1</span><span>Apr 9</span><span>Apr 17</span><span>Apr 25</span><span>Apr 30</span></div></div></div></Card><Card className="chart-card activity-chart"><div className="card-heading"><div><h2>System activity</h2><p>Requests per minute.</p></div><Button size="sm">Last 24 hours <span>⌄</span></Button></div><div className="bar-chart">{[32,27,23,20,22,28,34,39,48,42,37,45,51,56,62,75,58,50,48,44,39,32].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="bar-labels"><span>12 AM</span><span>4 AM</span><span>8 AM</span><span>12 PM</span><span>4 PM</span><span>8 PM</span></div></Card></section>
    <Card className="activity-table"><div className="card-heading"><div><h2>Recent activity</h2><p>Latest events from your workspace.</p></div><Button size="sm">View all activity <ArrowUpRight size={15} /></Button></div><div className="table-wrap"><table><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Details</th><th>IP address</th><th /></tr></thead><tbody>{activities.map((activity) => <tr key={activity.id}><td>{activity.timestamp}</td><td><span className="table-user"><span className="avatar small">{activity.actor.split(" ").map((part) => part[0]).join("")}</span>{activity.actor}</span></td><td>{activity.action}</td><td>{activity.detail}</td><td>{activity.ip}</td><td><button className="more-button" aria-label={`More actions for ${activity.actor}`}>•••</button></td></tr>)}</tbody></table></div></Card>
    <div className="mobile-note"><CheckCircle2 size={16} /> Designed to work beautifully on mobile.</div>
  </div>;
}
