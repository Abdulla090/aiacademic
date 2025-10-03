import { featureConfig } from '../config/env';

export interface PWAInstallPrompt extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export class PWAService {
  private static instance: PWAService;
  private registration: ServiceWorkerRegistration | null = null;
  private installPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private updateAvailable = false;

  private constructor() {
    this.detectInstallation();
    this.setupInstallPrompt();
  }

  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  private detectInstallation(): void {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      this.isInstalled = true;
    }

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.installPrompt = null;
      
      if (featureConfig.debug) {
        console.log('PWA: App installed successfully');
      }
    });
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as PWAInstallPrompt;
      
      if (featureConfig.debug) {
        console.log('PWA: Install prompt available');
      }
    });
  }

  public async registerServiceWorker(): Promise<void> {
    if (!featureConfig.serviceWorker) {
      console.log('PWA: Service Worker disabled');
      return;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('PWA: Service Worker not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      if (featureConfig.debug) {
        console.log('PWA: Service Worker registered successfully');
      }

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              
              if (featureConfig.debug) {
                console.log('PWA: New version available');
              }
            }
          });
        }
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });

    } catch (error) {
      console.error('PWA: Failed to register Service Worker:', error);
    }
  }

  private handleServiceWorkerMessage(data: unknown): void {
    const messageData = data as Record<string, unknown>;
    if (featureConfig.debug) {
      console.log('PWA: Message from Service Worker:', messageData);
    }

    // Handle different message types
    switch (messageData.type) {
      case 'CACHE_UPDATED':
        // Handle cache updates
        break;
      case 'OFFLINE_STATUS':
        // Handle offline status changes
        break;
      default:
        break;
    }
  }

  public async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const result = await this.installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        if (featureConfig.debug) {
          console.log('PWA: User accepted install prompt');
        }
        return true;
      } else {
        if (featureConfig.debug) {
          console.log('PWA: User dismissed install prompt');
        }
        return false;
      }
    } catch (error) {
      console.error('PWA: Failed to show install prompt:', error);
      return false;
    }
  }

  public canInstall(): boolean {
    return !this.isInstalled && this.installPrompt !== null;
  }

  public isAppInstalled(): boolean {
    return this.isInstalled;
  }

  public isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  public async updateApp(): Promise<void> {
    if (!this.registration || !this.updateAvailable) {
      return;
    }

    const waiting = this.registration.waiting;
    if (waiting) {
      waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  public async checkForUpdates(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
    } catch (error) {
      console.error('PWA: Failed to check for updates:', error);
    }
  }

  public async getInstallationInstructions(): Promise<string[]> {
    const platform = this.detectPlatform();
    
    switch (platform) {
      case 'ios':
        return [
          'Tap the Share button',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install the app',
        ];
      case 'android':
        return [
          'Tap the menu button (⋮)',
          'Select "Add to Home screen" or "Install app"',
          'Confirm the installation',
        ];
      case 'desktop':
        return [
          'Look for the install icon in the address bar',
          'Click the install button',
          'Confirm to add to your desktop',
        ];
      default:
        return [
          'Look for install options in your browser menu',
          'Add this app to your home screen or desktop',
        ];
    }
  }

  private detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    } else if (/android/.test(userAgent)) {
      return 'android';
    } else {
      return 'desktop';
    }
  }

  public async requestPersistentStorage(): Promise<boolean> {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const granted = await navigator.storage.persist();
        
        if (featureConfig.debug) {
          console.log('PWA: Persistent storage:', granted ? 'granted' : 'denied');
        }
        
        return granted;
      } catch (error) {
        console.error('PWA: Failed to request persistent storage:', error);
        return false;
      }
    }
    
    return false;
  }

  public async getStorageUsage(): Promise<{ used: number; quota: number } | null> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
        };
      } catch (error) {
        console.error('PWA: Failed to get storage usage:', error);
        return null;
      }
    }
    
    return null;
  }

  public async clearStorage(): Promise<void> {
    try {
      // Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear indexed DB (if used)
      if ('indexedDB' in window) {
        // This would require specific implementation based on your DB structure
      }

      if (featureConfig.debug) {
        console.log('PWA: Storage cleared successfully');
      }
    } catch (error) {
      console.error('PWA: Failed to clear storage:', error);
    }
  }
}

// React hooks for PWA functionality
import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const pwaService = PWAService.getInstance();
    
    const checkStatus = () => {
      setCanInstall(pwaService.canInstall());
      setIsInstalled(pwaService.isAppInstalled());
      setUpdateAvailable(pwaService.isUpdateAvailable());
    };

    // Initial check
    checkStatus();

    // Set up periodic checks
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const install = async () => {
    const success = await PWAService.getInstance().showInstallPrompt();
    if (success) {
      setCanInstall(false);
      setIsInstalled(true);
    }
    return success;
  };

  const update = async () => {
    await PWAService.getInstance().updateApp();
    setUpdateAvailable(false);
  };

  return {
    canInstall,
    isInstalled,
    updateAvailable,
    install,
    update,
    getInstructions: () => PWAService.getInstance().getInstallationInstructions(),
  };
};

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Export singleton
export const pwaService = PWAService.getInstance();

export default pwaService;