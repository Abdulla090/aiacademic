import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n';
import { validateConfig } from './config/env';
import { analyticsService } from './services/analytics';
import { performanceMonitor } from './utils/performance';
import { pwaService } from './services/pwa';
import { seoManager } from './utils/seo';
import { securityService } from './services/security';
import { cacheService, resourceLoader } from './services/cache';
import { monitoringService } from './services/monitoring';

// Initialize configuration
try {
  validateConfig();
  monitoringService.logInfo('Application configuration validated', 'startup');
} catch (error) {
  monitoringService.logError('Failed to initialize application configuration', error as Error);
}

// Initialize services
try {
  analyticsService.initialize();
  pwaService.registerServiceWorker();
  securityService.initialize();
  seoManager.addOrganizationStructuredData();
  seoManager.addWebsiteStructuredData();
  resourceLoader.setupLazyLoading();
  
  monitoringService.logInfo('All services initialized successfully', 'startup');
} catch (error) {
  monitoringService.logError('Failed to initialize services', error as Error);
}

// Set dark theme as default
if (localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme')) {
  document.documentElement.classList.add('dark');
}

// Log successful startup
monitoringService.logInfo('Application started', 'startup', {
  url: window.location.href,
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString(),
});

createRoot(document.getElementById("root")!).render(<App />);
