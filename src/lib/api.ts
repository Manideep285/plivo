import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

export interface StatusCheckResponse {
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  lastChecked: Date;
  message?: string;
}

export interface ServiceMetrics {
  uptime: number;
  responseTime: number;
  checks: StatusCheckResponse[];
  incidents: number;
  lastIncident?: Date;
}

export const statusApi = {
  checkEndpoint: async (url: string): Promise<StatusCheckResponse> => {
    try {
      const start = Date.now();
      await fetch(url);
      const responseTime = Date.now() - start;

      return {
        status: 'up',
        responseTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        status: 'down',
        responseTime: 0,
        lastChecked: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  getServiceMetrics: async (serviceId: string, timeRange: string): Promise<ServiceMetrics> => {
    const response = await api.get(`/api/services/${serviceId}/metrics`, {
      params: { timeRange },
    });
    return response.data;
  },

  getHistoricalUptime: async (serviceId: string, timeRange: string) => {
    const response = await api.get(`/api/services/${serviceId}/uptime`, {
      params: { timeRange },
    });
    return response.data;
  },
};
