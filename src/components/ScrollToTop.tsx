import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * whenever the route changes. This ensures users always start at the top
 * when navigating to a new page.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Force immediate scroll to top on route change
    // Using multiple methods to ensure it works across all browsers
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also scroll any scrollable containers
    const scrollContainers = document.querySelectorAll('[data-scroll-container]');
    scrollContainers.forEach(container => {
      container.scrollTop = 0;
    });
  }, [pathname]);

  return null; // This component doesn't render anything
};
