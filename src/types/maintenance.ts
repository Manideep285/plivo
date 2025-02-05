export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
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
