import { MaintenanceStatus } from './enums';

export type MaintenanceImpact = 'none' | 'minor' | 'major';
export type MaintenanceRecurrence = 'once' | 'weekly' | 'monthly';

export interface Maintenance {
  id: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  impact: MaintenanceImpact;
  recurrence: MaintenanceRecurrence;
  serviceId: string;
  startDateTime: string;
  endDateTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceBase {
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
