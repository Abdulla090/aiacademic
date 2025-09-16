import { useState, useEffect } from 'react';

// Rate limiting status utilities
export interface RateLimitStatus {
  isRetrying: boolean;
  retryAttempt: number;
  maxRetries: number;
  nextRetryIn: number;
}

export class RateLimitNotifier {
  private static listeners: ((status: RateLimitStatus | null) => void)[] = [];
  private static currentStatus: RateLimitStatus | null = null;

  static subscribe(callback: (status: RateLimitStatus | null) => void) {
    this.listeners.push(callback);
    // Immediately call with current status
    callback(this.currentStatus);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  static updateStatus(status: RateLimitStatus | null) {
    this.currentStatus = status;
    this.listeners.forEach(listener => listener(status));
  }

  static notifyRetryStart(attempt: number, maxRetries: number, delayMs: number) {
    this.updateStatus({
      isRetrying: true,
      retryAttempt: attempt,
      maxRetries,
      nextRetryIn: delayMs
    });
  }

  static notifyRetryComplete() {
    this.updateStatus(null);
  }
}

// Hook for components to use rate limit status
export function useRateLimitStatus() {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);

  useEffect(() => {
    return RateLimitNotifier.subscribe(setStatus);
  }, []);

  return status;
}

// Helper function to format retry message
export function formatRetryMessage(status: RateLimitStatus, language: 'ku' | 'en' = 'ku'): string {
  if (language === 'ku') {
    return `هەوڵی ${status.retryAttempt}/${status.maxRetries} - چاوەڕوانی ${Math.round(status.nextRetryIn / 1000)} چرکە...`;
  } else {
    return `Retry ${status.retryAttempt}/${status.maxRetries} - waiting ${Math.round(status.nextRetryIn / 1000)}s...`;
  }
}