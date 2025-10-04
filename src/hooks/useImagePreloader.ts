/**
 * Utility hook for preloading images
 * This helps improve perceived performance by loading images before they're needed
 */

import { useEffect } from 'react';

/**
 * Preload images by creating Image objects in the browser
 * @param imageUrls Array of image URLs to preload
 */
export const useImagePreloader = (imageUrls: string[]) => {
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      images.push(img);
    });

    // Cleanup function (optional, but good practice)
    return () => {
      images.forEach(img => {
        img.src = '';
      });
    };
  }, [imageUrls]);
};

/**
 * Preload a single image
 * @param imageUrl Image URL to preload
 */
export const useImagePreload = (imageUrl: string) => {
  useImagePreloader([imageUrl]);
};

/**
 * Get all dashboard card images that need to be preloaded
 */
export const getDashboardImages = () => {
  return [
    // Writing category tools
    '/card-images/article.png',
    '/card-images/new-report.png',
    '/card-images/grammar-fix.jpeg',
    '/card-images/grammar-fix.png',
    '/card-images/summarizer.png',
    
    // Study category tools
    '/card-images/mindmap.png',
    '/card-images/flashcard.png',
    '/card-images/quiz.png',
    
    // Presentation category
    '/card-images/presentation.jpeg',
    '/card-images/presentation.png',
    
    // Tools category
    '/card-images/imaage-converter.png',
    
    // Category images (shown on main dashboard)
    '/card-images/writting.png',
    '/card-images/study.jpeg',
    '/card-images/tools.jpeg',
    '/card-images/general.jpeg',
  ];
};

/**
 * Preload all dashboard images
 * Use this in components that lead to the dashboard (like LandingPage)
 */
export const useDashboardImagePreloader = () => {
  useImagePreloader(getDashboardImages());
};
