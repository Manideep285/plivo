export type StatusCheckType = 'http' | 'tcp' | 'icmp';

export interface StatusCheckConfig {
  id: string;
  serviceId: string;
  type: StatusCheckType;
  name: string;
  target: string;
  interval: number; // in seconds
  timeout: number; // in seconds
  expectedStatusCode?: number; // for HTTP checks
  headers?: Record<string, string>; // for HTTP checks
  port?: number; // for TCP checks
  retries: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StatusCheckResult {
  id: string;
  checkId: string;
  timestamp: string;
  success: boolean;
  latency: number; // in milliseconds
  error?: string;
  statusCode?: number; // for HTTP checks
  responseTime?: number;
}

export interface StatusCheckStats {
  checkId: string;
  uptime: number; // percentage
  averageLatency: number;
  lastCheckTime: string;
  checksPerformed: number;
  successfulChecks: number;
  failedChecks: number;
}
