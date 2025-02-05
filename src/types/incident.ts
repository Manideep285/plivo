export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export type IncidentSeverity = 'minor' | 'major' | 'critical';

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  serviceId: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  organizationId: string;
  createdBy: string;
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  message: string;
  status?: IncidentStatus;
  createdAt: string;
  createdBy: string;
}

export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  serviceIds: string[];
  organizationId: string;
  createdBy: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}
