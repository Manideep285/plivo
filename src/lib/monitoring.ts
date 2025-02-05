type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type MetricType = 'counter' | 'gauge' | 'histogram';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

interface Metric {
  name: string;
  value: number;
  type: MetricType;
  tags?: Record<string, string>;
}

class Monitoring {
  private static instance: Monitoring;
  private logs: LogEntry[] = [];
  private metrics: Map<string, Metric> = new Map();

  private constructor() {
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handleRejection.bind(this));
    this.setupPerformanceMonitoring();
  }

  public static getInstance(): Monitoring {
    if (!Monitoring.instance) {
      Monitoring.instance = new Monitoring();
    }
    return Monitoring.instance;
  }

  // Logging
  public log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    this.logs.push(entry);
    this.sendToBackend(entry);

    if (process.env.NODE_ENV === 'development') {
      console[level](message, context);
    }
  }

  // Metrics
  public recordMetric(
    name: string,
    value: number,
    type: MetricType = 'counter',
    tags?: Record<string, string>
  ) {
    const metric: Metric = { name, value, type, tags };
    this.metrics.set(name, metric);
    this.sendMetricToBackend(metric);
  }

  // Error Handling
  private handleError(event: ErrorEvent) {
    this.log('error', 'Uncaught error', {
      message: event.message,
      filename: event.filename,
      lineNo: event.lineno,
      colNo: event.colno,
      stack: event.error?.stack,
    });
  }

  private handleRejection(event: PromiseRejectionEvent) {
    this.log('error', 'Unhandled promise rejection', {
      reason: event.reason,
    });
  }

  // Performance Monitoring
  private setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      // Monitor largest contentful paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('lcp', lastEntry.startTime, 'gauge');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor first input delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('fid', entry.duration, 'histogram');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Monitor cumulative layout shift
      const clsObserver = new PerformanceObserver((entryList) => {
        let cls = 0;
        entryList.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        });
        this.recordMetric('cls', cls, 'gauge');
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }
  }

  // Backend Communication
  private async sendToBackend(entry: LogEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send log to backend:', error);
    }
  }

  private async sendMetricToBackend(metric: Metric) {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.error('Failed to send metric to backend:', error);
    }
  }

  // User Session Monitoring
  public trackUserAction(action: string, details?: Record<string, any>) {
    this.log('info', `User Action: ${action}`, {
      ...details,
      timestamp: Date.now(),
      url: window.location.href,
    });
  }

  // API Performance Monitoring
  public trackApiCall(
    endpoint: string,
    method: string,
    startTime: number,
    endTime: number,
    status: number
  ) {
    const duration = endTime - startTime;
    this.recordMetric(`api_call_duration_${endpoint}`, duration, 'histogram', {
      method,
      status: status.toString(),
    });
  }
}

export const monitoring = Monitoring.getInstance();
