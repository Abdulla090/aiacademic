import { cacheConfig, featureConfig } from '../config/env';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  serialize?: boolean; // Whether to serialize complex objects
}

export class CacheService {
  private static instance: CacheService;
  private memoryCache = new Map<string, { data: unknown; expiry: number; size: number }>();
  private cacheSize = 0;
  private maxCacheSize = 50 * 1024 * 1024; // 50MB

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Set item in cache
   */
  public set<T = unknown>(key: string, data: T, options: CacheOptions = {}): void {
    try {
      const ttl = options.ttl || cacheConfig.duration;
      const expiry = Date.now() + ttl;
      
      // Calculate size
      const serialized = options.serialize !== false ? JSON.stringify(data) : data;
      const size = this.calculateSize(serialized);

      // Check cache size limits
      if (this.cacheSize + size > this.maxCacheSize) {
        this.evictOldest();
      }

      // Remove existing item if it exists
      if (this.memoryCache.has(key)) {
        const existing = this.memoryCache.get(key)!;
        this.cacheSize -= existing.size;
      }

      this.memoryCache.set(key, { data: serialized, expiry, size });
      this.cacheSize += size;

      if (featureConfig.debug) {
        console.log(`Cache: Set ${key} (${this.formatSize(size)})`);
      }
    } catch (error) {
      console.error('Cache: Failed to set item:', error);
    }
  }

  /**
   * Get item from cache
   */
  public get<T = unknown>(key: string): T | null {
    try {
      const item = this.memoryCache.get(key);
      
      if (!item) {
        return null;
      }

      // Check expiry
      if (Date.now() > item.expiry) {
        this.delete(key);
        return null;
      }

      if (featureConfig.debug) {
        console.log(`Cache: Hit ${key}`);
      }

      return item.data as T;
    } catch (error) {
      console.error('Cache: Failed to get item:', error);
      return null;
    }
  }

  /**
   * Delete item from cache
   */
  public delete(key: string): boolean {
    const item = this.memoryCache.get(key);
    if (item) {
      this.cacheSize -= item.size;
      this.memoryCache.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Clear all cache
   */
  public clear(): void {
    this.memoryCache.clear();
    this.cacheSize = 0;
    
    if (featureConfig.debug) {
      console.log('Cache: Cleared all items');
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): { items: number; size: number; formattedSize: string } {
    return {
      items: this.memoryCache.size,
      size: this.cacheSize,
      formattedSize: this.formatSize(this.cacheSize),
    };
  }

  /**
   * Evict oldest items when cache is full
   */
  private evictOldest(): void {
    const sortedEntries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.expiry - b.expiry);

    const toEvict = Math.ceil(sortedEntries.length * 0.1); // Evict 10% of items
    
    for (let i = 0; i < toEvict && sortedEntries.length > 0; i++) {
      const [key] = sortedEntries[i];
      this.delete(key);
    }

    if (featureConfig.debug) {
      console.log(`Cache: Evicted ${toEvict} oldest items`);
    }
  }

  /**
   * Calculate approximate size of data
   */
  private calculateSize(data: unknown): number {
    if (typeof data === 'string') {
      return data.length * 2; // 2 bytes per character
    }
    return JSON.stringify(data).length * 2;
  }

  /**
   * Format size for display
   */
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Cleanup expired items
   */
  public cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiry) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));

    if (featureConfig.debug && expiredKeys.length > 0) {
      console.log(`Cache: Cleaned up ${expiredKeys.length} expired items`);
    }
  }
}

/**
 * Memoization decorator for functions
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: CacheOptions = {}
): T {
  const cache = CacheService.getInstance();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = `memoize_${fn.name}_${JSON.stringify(args)}`;
    
    let result = cache.get<ReturnType<T>>(key);
    if (result === null) {
      result = fn(...args) as ReturnType<T>;
      cache.set(key, result, options);
    }
    
    return result;
  }) as T;
}

/**
 * Async function memoization
 */
export function memoizeAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: CacheOptions = {}
): T {
  const cache = CacheService.getInstance();
  const pendingPromises = new Map<string, Promise<unknown>>();
  
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const key = `memoize_async_${fn.name}_${JSON.stringify(args)}`;
    
    // Check cache first
    const result = cache.get<Awaited<ReturnType<T>>>(key);
    if (result !== null) {
      return result;
    }

    // Check if there's a pending promise for the same key
    if (pendingPromises.has(key)) {
      return pendingPromises.get(key)! as Promise<Awaited<ReturnType<T>>>;
    }

    // Create new promise and cache it
    const promise = fn(...args).then(result => {
      cache.set(key, result, options);
      pendingPromises.delete(key);
      return result;
    }).catch(error => {
      pendingPromises.delete(key);
      throw error;
    });

    pendingPromises.set(key, promise);
    return promise as Promise<Awaited<ReturnType<T>>>;
  }) as T;
}

/**
 * Image optimization utility
 */
export class ImageOptimizer {
  private static instance: ImageOptimizer;

  private constructor() {}

  public static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  /**
   * Compress image file
   */
  public async compressImage(
    file: File,
    quality: number = 0.8,
    maxWidth: number = 1920,
    maxHeight: number = 1080
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate optimal dimensions
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  /**
   * Convert image to WebP format
   */
  public async convertToWebP(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.webp'),
                { type: 'image/webp', lastModified: Date.now() }
              );
              resolve(webpFile);
            } else {
              reject(new Error('Failed to convert to WebP'));
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}

/**
 * Resource loading optimization
 */
export class ResourceLoader {
  private static instance: ResourceLoader;
  private loadedResources = new Set<string>();

  private constructor() {}

  public static getInstance(): ResourceLoader {
    if (!ResourceLoader.instance) {
      ResourceLoader.instance = new ResourceLoader();
    }
    return ResourceLoader.instance;
  }

  /**
   * Preload critical resources
   */
  public preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font'): void {
    if (this.loadedResources.has(url)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;

    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'image':
        link.as = 'image';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
    }

    document.head.appendChild(link);
    this.loadedResources.add(url);
  }

  /**
   * Lazy load images
   */
  public setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }
}

// React hooks for optimization
import { useEffect, useCallback, useMemo } from 'react';

export const useCache = () => {
  const cache = CacheService.getInstance();

  useEffect(() => {
    // Set up periodic cleanup
    const interval = setInterval(() => {
      cache.cleanup();
    }, 5 * 60 * 1000); // Clean up every 5 minutes

    return () => clearInterval(interval);
  }, [cache]);

  const memoizedCallback = useCallback((fn: (...args: unknown[]) => unknown, deps: unknown[], options?: CacheOptions) => {
    return memoize(fn, options);
  }, []);

  return {
    cache,
    memoizedCallback,
    stats: cache.getStats(),
  };
};

export const useImageOptimization = () => {
  const optimizer = ImageOptimizer.getInstance();

  const compressImage = useCallback(async (
    file: File,
    quality?: number,
    maxWidth?: number,
    maxHeight?: number
  ) => {
    return optimizer.compressImage(file, quality, maxWidth, maxHeight);
  }, [optimizer]);

  const convertToWebP = useCallback(async (file: File, quality?: number) => {
    return optimizer.convertToWebP(file, quality);
  }, [optimizer]);

  return {
    compressImage,
    convertToWebP,
  };
};

// Export singletons
export const cacheService = CacheService.getInstance();
export const imageOptimizer = ImageOptimizer.getInstance();
export const resourceLoader = ResourceLoader.getInstance();

export default cacheService;