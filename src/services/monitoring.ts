import { featureConfig, analyticsConfig, appConfig } from '../config/env';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  category?: string;
  metadata?: Record<string, unknown>;
  stack?: string;
  userId?: string;
  sessionId?: string;
}

export class MonitoringService {
  private static instance: MonitoringService;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private sessionId: string;
  private errorCount = 0;
  private warningCount = 0;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupErrorHandlers();
    this.setupPerformanceMonitoring();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError('Global Error', event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', event.reason, {
        type: 'promise_rejection',
      });
    });

    // Console error interception
    const originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      this.log(LogLevel.ERROR, args.join(' '), 'console');
      originalConsoleError.apply(console, args);
    };

    // Console warning interception
    const originalConsoleWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      this.log(LogLevel.WARN, args.join(' '), 'console');
      originalConsoleWarn.apply(console, args);
    };
  }

  private setupPerformanceMonitoring(): void {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.log(LogLevel.WARN, 'Long task detected', 'performance', {
              duration: entry.duration,
              startTime: entry.startTime,
            });
          }
        });

        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('Long task observer not supported');
      }
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
        if (memory) {
          const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
          
          if (usageRatio > 0.8) {
            this.log(LogLevel.WARN, 'High memory usage detected', 'performance', {
              usedMemory: memory.usedJSHeapSize,
              totalMemory: memory.jsHeapSizeLimit,
              usageRatio: Math.round(usageRatio * 100),
            });
          }
        }
      }, 30000); // Check every 30 seconds
    }
  }

  public log(
    level: LogLevel,
    message: string,
    category?: string,
    metadata?: Record<string, unknown>
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      category,
      metadata,
      sessionId: this.sessionId,
    };

    // Add to local logs
    this.logs.push(entry);

    // Maintain log size limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Update counters
    if (level === LogLevel.ERROR) {
      this.errorCount++;
    } else if (level === LogLevel.WARN) {
      this.warningCount++;
    }

    // Send to external services if configured
    this.sendToExternalServices(entry);

    // Console output in development
    if (featureConfig.debug) {
      const logMethod = level === LogLevel.ERROR ? 'error' : 
                       level === LogLevel.WARN ? 'warn' : 'log';
      console[logMethod](`[${category || 'APP'}] ${message}`, metadata || '');
    }
  }

  public logError(message: string, error: Error, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, 'error', {
      ...metadata,
      error: error.message,
      stack: error.stack,
    });
  }

  public logInfo(message: string, category?: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, category, metadata);
  }

  public logWarning(message: string, category?: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, category, metadata);
  }

  public logDebug(message: string, category?: string, metadata?: Record<string, unknown>): void {
    if (featureConfig.debug) {
      this.log(LogLevel.DEBUG, message, category, metadata);
    }
  }

  private sendToExternalServices(entry: LogEntry): void {
    // Send to Sentry if configured
    if (analyticsConfig.sentryDsn && (entry.level === LogLevel.ERROR || entry.level === LogLevel.WARN)) {
      this.sendToSentry(entry);
    }

    // Send to Google Analytics for errors
    if (entry.level === LogLevel.ERROR && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'exception', {
        description: entry.message,
        fatal: false,
        custom_metadata: JSON.stringify(entry.metadata || {}),
      });
    }
  }

  private sendToSentry(entry: LogEntry): void {
    // This would be implemented with actual Sentry SDK
    if (featureConfig.debug) {
      console.log('Would send to Sentry:', entry);
    }
  }

  public getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  public getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  public getErrorSummary(): {
    totalErrors: number;
    totalWarnings: number;
    recentErrors: LogEntry[];
    errorRate: number;
  } {
    const recentErrors = this.getLogsByLevel(LogLevel.ERROR).slice(-10);
    const sessionDuration = Date.now() - (this.logs[0]?.timestamp || Date.now());
    const errorRate = sessionDuration > 0 ? (this.errorCount / sessionDuration) * 60000 : 0; // errors per minute

    return {
      totalErrors: this.errorCount,
      totalWarnings: this.warningCount,
      recentErrors,
      errorRate,
    };
  }

  public clearLogs(): void {
    this.logs = [];
    this.errorCount = 0;
    this.warningCount = 0;
  }

  public exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      timestamp: Date.now(),
      appVersion: appConfig.version,
      userAgent: navigator.userAgent,
      logs: this.logs,
      summary: this.getErrorSummary(),
    }, null, 2);
  }

  public async submitBugReport(
    description: string,
    email?: string,
    reproductionSteps?: string
  ): Promise<boolean> {
    try {
      const report = {
        description,
        email,
        reproductionSteps,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        appVersion: appConfig.version,
        userAgent: navigator.userAgent,
        url: window.location.href,
        logs: this.getRecentLogs(50),
        errorSummary: this.getErrorSummary(),
      };

      // In a real implementation, this would send to your bug tracking system
      if (featureConfig.debug) {
        console.log('Bug report:', report);
      }

      // For now, just log to monitoring
      this.logInfo('Bug report submitted', 'bug_report', {
        description: description.substring(0, 100),
        hasEmail: !!email,
        hasSteps: !!reproductionSteps,
      });

      return true;
    } catch (error) {
      this.logError('Failed to submit bug report', error as Error);
      return false;
    }
  }

  // Health check functionality
  public getHealthStatus(): {
    status: 'healthy' | 'warning' | 'error';
    checks: Array<{ name: string; status: boolean; message?: string }>;
  } {
    const checks = [
      {
        name: 'API Connection',
        status: navigator.onLine,
        message: navigator.onLine ? 'Online' : 'Offline',
      },
      {
        name: 'Local Storage',
        status: this.testLocalStorage(),
        message: this.testLocalStorage() ? 'Available' : 'Not available',
      },
      {
        name: 'Error Rate',
        status: this.getErrorSummary().errorRate < 1,
        message: `${this.getErrorSummary().errorRate.toFixed(2)} errors/min`,
      },
      {
        name: 'Memory Usage',
        status: this.checkMemoryUsage(),
        message: this.getMemoryUsage(),
      },
    ];

    const failedChecks = checks.filter(check => !check.status);
    const status = failedChecks.length === 0 ? 'healthy' : 
                  failedChecks.length <= 2 ? 'warning' : 'error';

    return { status, checks };
  }

  private testLocalStorage(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private checkMemoryUsage(): boolean {
    if ('memory' in performance) {
      const memory = (performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return usageRatio < 0.8;
    }
    return true; // Assume healthy if can't check
  }

  private getMemoryUsage(): string {
    if ('memory' in performance) {
      const memory = (performance as unknown as { memory: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return `${Math.round(usageRatio * 100)}% used`;
    }
    return 'Unknown';
  }
}

// React hooks for monitoring
import { useState, useEffect } from 'react';

export const useMonitoring = () => {
  const [healthStatus, setHealthStatus] = useState<ReturnType<MonitoringService['getHealthStatus']>>();
  const monitoring = MonitoringService.getInstance();

  useEffect(() => {
    const updateHealth = () => {
      setHealthStatus(monitoring.getHealthStatus());
    };

    updateHealth();
    const interval = setInterval(updateHealth, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [monitoring]);

  return {
    monitoring,
    healthStatus,
    logError: monitoring.logError.bind(monitoring),
    logInfo: monitoring.logInfo.bind(monitoring),
    logWarning: monitoring.logWarning.bind(monitoring),
    logDebug: monitoring.logDebug.bind(monitoring),
    getErrorSummary: monitoring.getErrorSummary.bind(monitoring),
    submitBugReport: monitoring.submitBugReport.bind(monitoring),
  };
};

export const useErrorBoundaryLogger = () => {
  const monitoring = MonitoringService.getInstance();

  return {
    logError: (error: Error, errorInfo: unknown) => {
      const info = errorInfo as { componentStack?: string };
      monitoring.logError('React Error Boundary', error, {
        componentStack: info.componentStack,
      });
    },
  };
};

// Export singleton
export const monitoringService = MonitoringService.getInstance();

export default monitoringService;