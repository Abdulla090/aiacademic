import { useState, useEffect } from 'react';

export interface ScreenSizes {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  height: number;
}

export const useResponsive = (): ScreenSizes => {
  const [screenSizes, setScreenSizes] = useState<ScreenSizes>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSizes({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024 && width < 1440,
        isLargeDesktop: width >= 1440,
        width,
        height,
      });
    };

    // Initial call
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSizes;
};

export const responsiveClasses = {
  container: {
    base: "container mx-auto px-4 py-8",
    mobile: "px-4 py-6",
    tablet: "px-6 py-8", 
    desktop: "px-8 py-10"
  },
  grid: {
    mobile: "grid gap-4",
    tablet: "grid gap-6 md:grid-cols-2",
    desktop: "grid gap-8 lg:grid-cols-2"
  },
  card: {
    mobile: "card w-full",
    tablet: "card",
    desktop: "card"
  },
  button: {
    mobile: "w-full text-sm",
    tablet: "min-w-[120px]",
    desktop: "min-w-[140px]"
  },
  text: {
    heading: {
      mobile: "text-2xl font-bold",
      tablet: "text-3xl font-bold", 
      desktop: "text-3xl font-bold"
    },
    subheading: {
      mobile: "text-sm text-muted-foreground",
      tablet: "text-base text-muted-foreground",
      desktop: "text-base text-muted-foreground"
    }
  },
  spacing: {
    section: {
      mobile: "mb-6",
      tablet: "mb-8",
      desktop: "mb-8"
    },
    element: {
      mobile: "gap-2",
      tablet: "gap-3",
      desktop: "gap-3"
    }
  }
};

export const getResponsiveClass = (
  breakpoint: keyof ScreenSizes,
  classMap: Record<string, string>
) => {
  if (breakpoint === 'isMobile') return classMap.mobile || classMap.base;
  if (breakpoint === 'isTablet') return classMap.tablet || classMap.base;
  if (breakpoint === 'isDesktop') return classMap.desktop || classMap.base;
  if (breakpoint === 'isLargeDesktop') return classMap.desktop || classMap.base;
  return classMap.base;
};