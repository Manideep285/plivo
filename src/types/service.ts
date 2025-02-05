export type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  description: string;
  updatedAt?: Date;
  monitoredUrl?: string;
}

export interface ServiceMetrics {
  uptime: number;
  responseTime: number;
  lastChecked: Date;
  incidents: number;
  lastIncident?: Date;
}
