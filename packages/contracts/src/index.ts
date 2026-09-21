export type UserStatus = "active" | "invited" | "suspended";

export interface UserSummary {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly status: UserStatus;
  readonly lastActive: string;
}

export interface ActivityEvent {
  readonly id: string;
  readonly actor: string;
  readonly action: string;
  readonly detail: string;
  readonly timestamp: string;
  readonly ip: string;
}

export interface DashboardMetric {
  readonly label: string;
  readonly value: string;
  readonly change?: string;
  readonly tone: "positive" | "neutral" | "warning";
}

export interface RoleSummary {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly members: number;
  readonly permissions: number;
  readonly system: boolean;
}
