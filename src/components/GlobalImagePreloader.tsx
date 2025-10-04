/**
 * Global Image Preloader Component
 * 
 * This component should be placed in the App root to start preloading
 * critical images as early as possible in the application lifecycle.
 * 
 * It intelligently preloads images based on the current route and
 * user's likely navigation patterns.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getDashboardImages } from '@/hooks/useImagePreloader';

export const GlobalImagePreloader = () => {
  const location = useLocation();

  useEffect(() => {
    // If user is on landing page or root, preload dashboard images
    if (location.pathname === '/' || location.pathname === '/landing') {
      const images = getDashboardImages();
      
      // Use requestIdleCallback to preload during idle time
      // This ensures we don't block the main thread
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          preloadImages(images);
        });
      } else {
        // Fallback for browsers that don't support requestIdleCallback
        setTimeout(() => {
          preloadImages(images);
        }, 100);
      }
    }
  }, [location.pathname]);

  return null;
};

/**
 * Preload images using the most efficient method available
 */
function preloadImages(imageUrls: string[]) {
  imageUrls.forEach((url, index) => {
    // Stagger the preloading to avoid network congestion
    setTimeout(() => {
      // Method 1: Create link element (most efficient)
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      
      // Prioritize first few images
      if (index < 5) {
        link.setAttribute('fetchpriority', 'high');
      }
      
      document.head.appendChild(link);

      // Method 2: Create Image object (backup)
      const img = new Image();
      img.src = url;
    }, index * 50); // Stagger by 50ms
  });
}
