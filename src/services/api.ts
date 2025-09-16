import { geminiConfig, featureConfig } from '../config/env';

export interface APIError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export class APIService {
  private static instance: APIService;
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000;

  private constructor() {
    this.baseURL = geminiConfig.apiUrl;
    this.timeout = geminiConfig.timeout;
  }

  public static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createError(message: string, status?: number, code?: string, details?: any): APIError {
    const error = new Error(message) as APIError;
    error.status = status;
    error.code = code;
    error.details = details;
    return error;
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails: any = null;

      try {
        errorDetails = await response.json();
        if (errorDetails.error?.message) {
          errorMessage = errorDetails.error.message;
        }
      } catch {
        // If JSON parsing fails, use the status text
      }

      throw this.createError(
        errorMessage,
        response.status,
        errorDetails?.error?.code,
        errorDetails
      );
    }

    try {
      return await response.json();
    } catch (error) {
      throw this.createError('Invalid JSON response from server');
    }
  }

  private async makeRequest(
    url: string,
    options: RequestInit,
    attempt: number = 1
  ): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return await this.handleResponse(response);
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Check if it's a network error and we should retry
      const shouldRetry = attempt < this.retryAttempts && (
        error.name === 'AbortError' ||
        error.code === 'NETWORK_ERROR' ||
        (error.status && error.status >= 500)
      );

      if (shouldRetry) {
        if (featureConfig.debug) {
          console.warn(`API request failed, retrying (${attempt}/${this.retryAttempts})...`, error);
        }
        
        await this.delay(this.retryDelay * attempt);
        return this.makeRequest(url, options, attempt + 1);
      }

      // Transform fetch errors
      if (error.name === 'AbortError') {
        throw this.createError('Request timeout', 408, 'TIMEOUT');
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw this.createError('Network connection failed', 0, 'NETWORK_ERROR');
      }

      throw error;
    }
  }

  public async post(endpoint: string, data: any, additionalHeaders?: Record<string, string>): Promise<any> {
    if (!geminiConfig.apiKey) {
      throw this.createError('API key not configured', 401, 'MISSING_API_KEY');
    }

    const url = `${this.baseURL}${endpoint}?key=${geminiConfig.apiKey}`;
    
    return this.makeRequest(url, {
      method: 'POST',
      headers: {
        ...additionalHeaders,
      },
      body: JSON.stringify(data),
    });
  }

  public async get(endpoint: string, params?: Record<string, string>): Promise<any> {
    if (!geminiConfig.apiKey) {
      throw this.createError('API key not configured', 401, 'MISSING_API_KEY');
    }

    const searchParams = new URLSearchParams(params);
    searchParams.set('key', geminiConfig.apiKey);
    const url = `${this.baseURL}${endpoint}?${searchParams}`;
    
    return this.makeRequest(url, {
      method: 'GET',
    });
  }

  // Rate limiting helper
  private lastRequestTime: number = 0;
  private requestCount: number = 0;
  private readonly rateLimitWindow: number = 60000; // 1 minute

  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - this.lastRequestTime > this.rateLimitWindow) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    if (this.requestCount >= geminiConfig.rateLimit) {
      const waitTime = this.rateLimitWindow - (now - this.lastRequestTime);
      throw this.createError(
        `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        429,
        'RATE_LIMIT_EXCEEDED',
        { waitTime }
      );
    }

    this.requestCount++;
  }

  public async postWithRateLimit(endpoint: string, data: any): Promise<any> {
    await this.checkRateLimit();
    return this.post(endpoint, data);
  }
}

// Export singleton instance
export const apiService = APIService.getInstance();

// Helper function for error handling in components
export const handleAPIError = (error: any): string => {
  if (error.code === 'MISSING_API_KEY') {
    return 'API key not configured. Please check your environment settings.';
  }
  
  if (error.code === 'TIMEOUT') {
    return 'Request timed out. Please check your internet connection and try again.';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    return error.message;
  }
  
  if (error.status === 400) {
    return 'Invalid request. Please check your input and try again.';
  }
  
  if (error.status === 401) {
    return 'Authentication failed. Please check your API key.';
  }
  
  if (error.status === 403) {
    return 'Access denied. You may not have permission to perform this action.';
  }
  
  if (error.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  if (error.status && error.status >= 500) {
    return 'Server error occurred. Please try again later.';
  }
  
  // Fallback to error message or generic message
  return error.message || 'An unexpected error occurred. Please try again.';
};

export default apiService;