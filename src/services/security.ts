import { featureConfig } from '../config/env';

export class SecurityService {
  private static instance: SecurityService;

  private constructor() {}

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  public sanitizeHTML(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * Sanitize user input for safe display
   */
  public sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate and sanitize URLs
   */
  public sanitizeURL(url: string): string | null {
    try {
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return null;
      }

      // Remove potential XSS payloads
      urlObj.search = urlObj.search.replace(/[<>]/g, '');
      
      return urlObj.toString();
    } catch {
      return null;
    }
  }

  /**
   * Generate Content Security Policy
   */
  public generateCSP(): string {
    const cspDirectives = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for Vite in dev mode
        "'unsafe-eval'", // Required for some libraries
        'https://www.googletagmanager.com',
        'https://static.hotjar.com',
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for CSS-in-JS and Tailwind
        'https://fonts.googleapis.com',
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
      ],
      'connect-src': [
        "'self'",
        'https://generativelanguage.googleapis.com',
        'https://www.google-analytics.com',
        'https://static.hotjar.com',
        'wss:', // For WebSocket connections
      ],
      'frame-src': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': [],
    };

    return Object.entries(cspDirectives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  }

  /**
   * Set security headers (for server implementation)
   */
  public getSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': this.generateCSP(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };
  }

  /**
   * Validate file uploads
   */
  public validateFileUpload(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
    
    if (!extension || !allowedExtensions.includes(extension)) {
      return { valid: false, error: 'File extension not allowed' };
    }

    return { valid: true };
  }

  /**
   * Generate secure random string
   */
  public generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash sensitive data (for client-side hashing)
   */
  public async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Rate limiting utility
   */
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  public checkRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * Clean up expired rate limit records
   */
  public cleanupRateLimit(): void {
    const now = Date.now();
    for (const [key, record] of this.rateLimitMap.entries()) {
      if (now > record.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }

  /**
   * Detect potential XSS attempts
   */
  public detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<link/gi,
      /<meta/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Validate API responses
   */
  public validateAPIResponse(response: unknown): boolean {
    if (typeof response !== 'object' || response === null) {
      return false;
    }

    // Check for common injection patterns in response
    const responseStr = JSON.stringify(response);
    if (this.detectXSS(responseStr)) {
      if (featureConfig.debug) {
        console.warn('Security: Potential XSS detected in API response');
      }
      return false;
    }

    return true;
  }

  /**
   * Secure local storage wrapper
   */
  public secureStorage = {
    setItem: (key: string, value: string): void => {
      try {
        const sanitizedKey = this.sanitizeInput(key);
        const sanitizedValue = this.sanitizeInput(value);
        localStorage.setItem(sanitizedKey, sanitizedValue);
      } catch (error) {
        console.error('Security: Failed to set storage item:', error);
      }
    },

    getItem: (key: string): string | null => {
      try {
        const sanitizedKey = this.sanitizeInput(key);
        return localStorage.getItem(sanitizedKey);
      } catch (error) {
        console.error('Security: Failed to get storage item:', error);
        return null;
      }
    },

    removeItem: (key: string): void => {
      try {
        const sanitizedKey = this.sanitizeInput(key);
        localStorage.removeItem(sanitizedKey);
      } catch (error) {
        console.error('Security: Failed to remove storage item:', error);
      }
    },
  };

  /**
   * Initialize security measures
   */
  public initialize(): void {
    // Set up periodic rate limit cleanup
    setInterval(() => {
      this.cleanupRateLimit();
    }, 60000); // Clean up every minute

    // Add security event listeners
    this.setupSecurityEventListeners();

    if (featureConfig.debug) {
      console.log('Security: Security service initialized');
    }
  }

  private setupSecurityEventListeners(): void {
    // Detect devtools
    const devtools = { open: false, orientation: null };
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        if (!devtools.open) {
          devtools.open = true;
          if (featureConfig.debug) {
            console.warn('Security: Developer tools detected');
          }
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Detect right-click (optional - might be too restrictive)
    if (!featureConfig.debug) {
      document.addEventListener('contextmenu', (e) => {
        // e.preventDefault(); // Uncomment to disable right-click
      });
    }

    // Monitor for suspicious activities
    let suspiciousActivity = 0;
    
    document.addEventListener('keydown', (e) => {
      // Detect common inspection shortcuts
      if ((e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
          (e.key === 'F12')) {
        suspiciousActivity++;
        if (suspiciousActivity > 5 && !featureConfig.debug) {
          console.warn('Security: Multiple inspection attempts detected');
        }
      }
    });
  }
}

// React hook for security
import { useEffect, useCallback } from 'react';

export const useSecurity = () => {
  const security = SecurityService.getInstance();

  useEffect(() => {
    security.initialize();
  }, [security]);

  const sanitizeInput = useCallback((input: string) => {
    return security.sanitizeInput(input);
  }, [security]);

  const validateFile = useCallback((file: File) => {
    return security.validateFileUpload(file);
  }, [security]);

  const checkRateLimit = useCallback((key: string, maxRequests?: number, windowMs?: number) => {
    return security.checkRateLimit(key, maxRequests, windowMs);
  }, [security]);

  return {
    sanitizeInput,
    validateFile,
    checkRateLimit,
    sanitizeHTML: security.sanitizeHTML,
    sanitizeURL: security.sanitizeURL,
    detectXSS: security.detectXSS,
    secureStorage: security.secureStorage,
  };
};

// Export singleton
export const securityService = SecurityService.getInstance();

export default securityService;