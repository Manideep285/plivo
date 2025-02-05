import { IncidentStatus, IncidentSeverity, MaintenanceStatus } from "./types/enums";

export { IncidentStatus, IncidentSeverity, MaintenanceStatus };

export type ServiceStatus = "operational" | "degraded" | "partial" | "major";

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  description: string;
}

export interface Team {
  id: string;
  name: string;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  message: string;
  status: IncidentStatus;
  createdAt: string;
}

export interface Maintenance {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: MaintenanceStatus;
  serviceId: string;
  serviceIds?: string[];
  impact?: string;
}