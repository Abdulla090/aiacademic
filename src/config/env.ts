// Environment Configuration Utility
export const config = {
  // API Configuration
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    apiUrl: import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    rateLimit: parseInt(import.meta.env.VITE_API_RATE_LIMIT || '60'),
  },

  // Application Settings
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'AI Academic Hub',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Kurdish Academic Platform',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    pwa: import.meta.env.VITE_ENABLE_PWA === 'true',
    offlineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
    debug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
    serviceWorker: import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'pdf,docx,txt,jpg,png,gif').split(','),
  },

  // Cache Configuration
  cache: {
    duration: parseInt(import.meta.env.VITE_CACHE_DURATION || '3600000'), // 1 hour
  },

  // Analytics
  analytics: {
    gaTrackingId: import.meta.env.VITE_GA_TRACKING_ID || '',
    hotjarId: import.meta.env.VITE_HOTJAR_ID || '',
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  },

  // Social Media
  social: {
    twitter: import.meta.env.VITE_SOCIAL_TWITTER || '',
    facebook: import.meta.env.VITE_SOCIAL_FACEBOOK || '',
    linkedin: import.meta.env.VITE_SOCIAL_LINKEDIN || '',
  },

  // Environment Detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
};

// Validation for required environment variables
export const validateConfig = () => {
  const errors: string[] = [];

  if (!config.gemini.apiKey && config.isProduction) {
    errors.push('VITE_GEMINI_API_KEY is required in production');
  }

  if (errors.length > 0) {
    console.error('Configuration errors:', errors);
    if (config.isProduction) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }

  return errors.length === 0;
};

// Export individual configs for easier imports
export const {
  gemini: geminiConfig,
  app: appConfig,
  features: featureConfig,
  upload: uploadConfig,
  cache: cacheConfig,
  analytics: analyticsConfig,
  social: socialConfig,
} = config;

export default config;