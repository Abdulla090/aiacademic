import { featureConfig, analyticsConfig } from '../config/env';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.setupObservers();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupObservers() {
    if (typeof window === 'undefined' || !featureConfig.analytics) return;

    try {
      // Observe navigation timing
      if ('PerformanceObserver' in window) {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.loadEventStart);
              this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
              this.recordMetric('first_byte', navEntry.responseStart - navEntry.requestStart);
            }
          }
        });
        
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      }

      // Observe resource timing
      if ('PerformanceObserver' in window) {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resourceEntry = entry as PerformanceResourceTiming;
              if (resourceEntry.duration > 1000) { // Only track slow resources
                this.recordMetric('slow_resource', resourceEntry.duration, {
                  name: resourceEntry.name,
                  type: resourceEntry.initiatorType,
                });
              }
            }
          }
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      }

      // Observe largest contentful paint
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('largest_contentful_paint', lastEntry.startTime);
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      }

      // Observe first input delay
      if ('PerformanceObserver' in window) {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as PerformanceEntry & { processingStart: number; startTime: number };
            if (fidEntry.processingStart) {
              this.recordMetric('first_input_delay', fidEntry.processingStart - fidEntry.startTime);
            }
          }
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      }

    } catch (error) {
      if (featureConfig.debug) {
        console.warn('Failed to setup performance observers:', error);
      }
    }
  }

  public recordMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Send to analytics if enabled
    if (featureConfig.analytics && analyticsConfig.gaTrackingId) {
      this.sendToAnalytics(metric);
    }

    if (featureConfig.debug) {
      console.log('Performance metric:', metric);
    }
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    try {
      // Send to Google Analytics 4
      if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'performance_metric', {
          custom_metric_name: metric.name,
          value: metric.value,
          custom_metadata: JSON.stringify(metric.metadata || {}),
        });
      }
    } catch (error) {
      if (featureConfig.debug) {
        console.warn('Failed to send performance metric to analytics:', error);
      }
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getAverageMetric(name: string): number | null {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return null;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  public clearMetrics() {
    this.metrics = [];
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Utility functions for measuring performance
export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    PerformanceMonitor.getInstance().recordMetric(name, duration, metadata);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    PerformanceMonitor.getInstance().recordMetric(`${name}_error`, duration, {
      ...metadata,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

export const measureSync = <T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, unknown>
): T => {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    PerformanceMonitor.getInstance().recordMetric(name, duration, metadata);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    PerformanceMonitor.getInstance().recordMetric(`${name}_error`, duration, {
      ...metadata,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
};

// React hook for performance monitoring
import { useEffect, useRef } from 'react';

export const usePerformanceTracker = (componentName: string) => {
  const mountTime = useRef<number>();
  const renderCount = useRef(0);

  useEffect(() => {
    mountTime.current = performance.now();
    return () => {
      if (mountTime.current) {
        const lifetime = performance.now() - mountTime.current;
        PerformanceMonitor.getInstance().recordMetric('component_lifetime', lifetime, {
          component: componentName,
          renderCount: renderCount.current,
        });
      }
    };
  }, [componentName]);

  useEffect(() => {
    renderCount.current++;
    PerformanceMonitor.getInstance().recordMetric('component_render', 1, {
      component: componentName,
    });
  });

  return {
    recordMetric: (name: string, value: number, metadata?: Record<string, unknown>) => {
      PerformanceMonitor.getInstance().recordMetric(name, value, {
        component: componentName,
        ...metadata,
      });
    },
  };
};

// Export singleton
export const performanceMonitor = PerformanceMonitor.getInstance();

// Web Vitals integration
export const reportWebVitals = (metric: unknown) => {
  const m = metric as { name: string; value: number; id: string; delta: number };
  if (featureConfig.analytics) {
    performanceMonitor.recordMetric(m.name, m.value, {
      id: m.id,
      delta: m.delta,
    });
  }
};

export default performanceMonitor;