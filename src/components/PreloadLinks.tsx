import { useEffect } from 'react';

interface PreloadLinksProps {
  images: string[];
}

/**
 * Component that adds <link rel="preload"> tags to the document head
 * This uses the browser's native preloading mechanism for better performance
 * 
 * Usage: <PreloadLinks images={['/path/to/image1.png', '/path/to/image2.jpg']} />
 */
export const PreloadLinks: React.FC<PreloadLinksProps> = ({ images }) => {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];

    images.forEach((imageUrl) => {
      // Check if link already exists to avoid duplicates
      const existingLink = document.querySelector(`link[href="${imageUrl}"]`);
      if (existingLink) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      
      // Add fetchpriority for critical images
      // The first few images get high priority
      if (links.length < 5) {
        link.setAttribute('fetchpriority', 'high');
      }

      document.head.appendChild(link);
      links.push(link);
    });

    // Cleanup: remove preload links when component unmounts
    return () => {
      links.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [images]);

  return null; // This component doesn't render anything
};

/**
 * Hook version of PreloadLinks for use in functional components
 */
export const usePreloadLinks = (images: string[]) => {
  useEffect(() => {
    const links: HTMLLinkElement[] = [];

    images.forEach((imageUrl) => {
      const existingLink = document.querySelector(`link[href="${imageUrl}"]`);
      if (existingLink) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      
      if (links.length < 5) {
        link.setAttribute('fetchpriority', 'high');
      }

      document.head.appendChild(link);
      links.push(link);
    });

    return () => {
      links.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [images]);
};
