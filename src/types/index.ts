export * from './enums';
export * from './maintenance';
export * from './incident';
export * from './service';
export * from './user';
export * from './team';
export * from './organization';

export type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";

export type Service = {
  id: string;
  name: string;
  status: ServiceStatus;
  description: string;
  monitoredUrl?: string;
  teamId?: string;
};

export type IncidentSeverity = "minor" | "major" | "critical";
export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved";

export type Incident = {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  updates?: IncidentUpdate[];
};

export type IncidentUpdate = {
  id: string;
  message: string;
  status: IncidentStatus;
  createdAt: string;
  createdBy: string;
};

export type TeamRole = "admin" | "member" | "viewer";
export type TeamMemberStatus = "active" | "invited" | "disabled";

export type Team = {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
};

export type TeamMember = {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  status: TeamMemberStatus;
  email: string;
  name: string;
  joinedAt?: string;
  invitedAt: string;
};
