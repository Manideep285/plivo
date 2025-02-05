import { StatusCheckConfig, StatusCheckResult, StatusCheckStats } from '@/types/statusCheck';

class StatusCheckService {
  private static instance: StatusCheckService;
  private checks: Map<string, NodeJS.Timeout> = new Map();
  private results: Map<string, StatusCheckResult[]> = new Map();

  private constructor() {}

  static getInstance(): StatusCheckService {
    if (!StatusCheckService.instance) {
      StatusCheckService.instance = new StatusCheckService();
    }
    return StatusCheckService.instance;
  }

  async startCheck(config: StatusCheckConfig): Promise<void> {
    if (this.checks.has(config.id)) {
      this.stopCheck(config.id);
    }

    const check = setInterval(async () => {
      const result = await this.performCheck(config);
      this.storeResult(config.id, result);
    }, config.interval * 1000);

    this.checks.set(config.id, check);
  }

  stopCheck(checkId: string): void {
    const check = this.checks.get(checkId);
    if (check) {
      clearInterval(check);
      this.checks.delete(checkId);
    }
  }

  private async performCheck(config: StatusCheckConfig): Promise<StatusCheckResult> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;
    let statusCode: number | undefined;

    try {
      if (config.type === 'http') {
        const response = await this.performHttpCheck(config);
        success = response.ok;
        statusCode = response.status;
      } else if (config.type === 'tcp') {
        success = await this.performTcpCheck(config);
      } else if (config.type === 'icmp') {
        success = await this.performIcmpCheck(config);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
    }

    const endTime = Date.now();
    const latency = endTime - startTime;

    return {
      id: crypto.randomUUID(),
      checkId: config.id,
      timestamp: new Date().toISOString(),
      success,
      latency,
      error,
      statusCode,
      responseTime: latency
    };
  }

  private async performHttpCheck(config: StatusCheckConfig): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout * 1000);

    try {
      const response = await fetch(config.target, {
        headers: config.headers,
        signal: controller.signal
      });

      if (config.expectedStatusCode && response.status !== config.expectedStatusCode) {
        throw new Error(`Expected status code ${config.expectedStatusCode} but got ${response.status}`);
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async performTcpCheck(config: StatusCheckConfig): Promise<boolean> {
    // Mock TCP check for now
    return Promise.resolve(Math.random() > 0.1);
  }

  private async performIcmpCheck(config: StatusCheckConfig): Promise<boolean> {
    // Mock ICMP check for now
    return Promise.resolve(Math.random() > 0.1);
  }

  private storeResult(checkId: string, result: StatusCheckResult): void {
    const results = this.results.get(checkId) || [];
    results.push(result);
    
    // Keep only last 1000 results
    if (results.length > 1000) {
      results.shift();
    }
    
    this.results.set(checkId, results);
  }

  getStats(checkId: string): StatusCheckStats {
    const results = this.results.get(checkId) || [];
    const successfulChecks = results.filter(r => r.success).length;
    
    return {
      checkId,
      uptime: (successfulChecks / results.length) * 100,
      averageLatency: results.reduce((sum, r) => sum + r.latency, 0) / results.length,
      lastCheckTime: results[results.length - 1]?.timestamp || new Date().toISOString(),
      checksPerformed: results.length,
      successfulChecks,
      failedChecks: results.length - successfulChecks
    };
  }

  getLatestResults(checkId: string, limit: number = 100): StatusCheckResult[] {
    const results = this.results.get(checkId) || [];
    return results.slice(-limit);
  }
}

export const statusCheckService = StatusCheckService.getInstance();
