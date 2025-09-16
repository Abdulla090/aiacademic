import { analyticsConfig, featureConfig } from '../config/env';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    hj?: (...args: any[]) => void;
  }
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized = false;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async initialize(): Promise<void> {
    if (!featureConfig.analytics || this.initialized) return;

    try {
      await Promise.all([
        this.initializeGoogleAnalytics(),
        this.initializeHotjar(),
      ]);
      
      this.initialized = true;
      
      if (featureConfig.debug) {
        console.log('Analytics services initialized');
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  private async initializeGoogleAnalytics(): Promise<void> {
    if (!analyticsConfig.gaTrackingId) return;

    try {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.gaTrackingId}`;
      document.head.appendChild(script);

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: any[]) {
        window.dataLayer!.push(args);
      };

      // Configure Google Analytics
      window.gtag('js', new Date());
      window.gtag('config', analyticsConfig.gaTrackingId, {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: false, // We'll send page views manually
      });

      if (featureConfig.debug) {
        console.log('Google Analytics initialized');
      }
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }

  private async initializeHotjar(): Promise<void> {
    if (!analyticsConfig.hotjarId) return;

    try {
      // Load Hotjar script
      const script = document.createElement('script');
      script.innerHTML = `
        (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:${analyticsConfig.hotjarId},hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
      `;
      document.head.appendChild(script);

      if (featureConfig.debug) {
        console.log('Hotjar initialized');
      }
    } catch (error) {
      console.error('Failed to initialize Hotjar:', error);
    }
  }

  public trackPageView(path: string, title?: string): void {
    if (!this.initialized || !featureConfig.analytics) return;

    try {
      // Google Analytics
      if (window.gtag && analyticsConfig.gaTrackingId) {
        window.gtag('config', analyticsConfig.gaTrackingId, {
          page_path: path,
          page_title: title || document.title,
        });
      }

      if (featureConfig.debug) {
        console.log('Page view tracked:', { path, title });
      }
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  public trackEvent(
    action: string,
    category: string = 'general',
    label?: string,
    value?: number,
    customParameters?: Record<string, any>
  ): void {
    if (!this.initialized || !featureConfig.analytics) return;

    try {
      // Google Analytics
      if (window.gtag) {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value,
          ...customParameters,
        });
      }

      if (featureConfig.debug) {
        console.log('Event tracked:', { action, category, label, value, customParameters });
      }
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  public trackFeatureUsage(featureName: string, metadata?: Record<string, any>): void {
    this.trackEvent('feature_used', 'features', featureName, undefined, metadata);
  }

  public trackError(error: Error, context?: string): void {
    this.trackEvent('error_occurred', 'errors', context || 'unknown', undefined, {
      error_message: error.message,
      error_stack: error.stack,
    });
  }

  public trackTiming(name: string, duration: number, category: string = 'performance'): void {
    this.trackEvent('timing_complete', category, name, Math.round(duration));
  }

  public trackUserEngagement(action: string, element?: string): void {
    this.trackEvent(action, 'engagement', element);
  }

  public setUserProperties(properties: Record<string, any>): void {
    if (!this.initialized || !featureConfig.analytics) return;

    try {
      if (window.gtag) {
        window.gtag('config', analyticsConfig.gaTrackingId, {
          custom_map: properties,
        });
      }

      if (featureConfig.debug) {
        console.log('User properties set:', properties);
      }
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  public identify(userId: string, userProperties?: Record<string, any>): void {
    if (!this.initialized || !featureConfig.analytics) return;

    try {
      if (window.gtag) {
        window.gtag('config', analyticsConfig.gaTrackingId, {
          user_id: userId,
          ...userProperties,
        });
      }

      if (featureConfig.debug) {
        console.log('User identified:', { userId, userProperties });
      }
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }
}

// React hooks for analytics
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    analyticsService.trackPageView(location.pathname);
  }, [location]);
};

export const useFeatureTracking = (featureName: string) => {
  useEffect(() => {
    analyticsService.trackFeatureUsage(featureName);
  }, [featureName]);

  return {
    trackAction: (action: string, metadata?: Record<string, any>) => {
      analyticsService.trackEvent(action, 'features', featureName, undefined, metadata);
    },
  };
};

// Export singleton
export const analyticsService = AnalyticsService.getInstance();

export default analyticsService;