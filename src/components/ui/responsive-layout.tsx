import React from 'react';
import { useResponsive } from '@/hooks/useResponsive';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'full' | '6xl' | '4xl' | '2xl';
  variant?: 'container' | 'grid' | 'stack';
  gridCols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = '',
  maxWidth = '6xl',
  variant = 'container',
  gridCols = { mobile: 1, tablet: 2, desktop: 2 }
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getContainerClasses = () => {
    const baseClasses = 'container mx-auto';
    const maxWidthClass = maxWidth === 'full' ? 'max-w-full' : `max-w-${maxWidth}`;
    
    if (isMobile) {
      return cn(baseClasses, maxWidthClass, 'px-4 py-6');
    }
    if (isTablet) {
      return cn(baseClasses, maxWidthClass, 'px-6 py-8');
    }
    return cn(baseClasses, maxWidthClass, 'px-8 py-10');
  };

  const getGridClasses = () => {
    const baseClasses = 'grid';
    
    if (isMobile) {
      return cn(baseClasses, 'gap-4', gridCols.mobile && `grid-cols-${gridCols.mobile}`);
    }
    if (isTablet) {
      return cn(baseClasses, 'gap-6', gridCols.tablet && `md:grid-cols-${gridCols.tablet}`);
    }
    return cn(baseClasses, 'gap-8', gridCols.desktop && `lg:grid-cols-${gridCols.desktop}`);
  };

  const getStackClasses = () => {
    const baseClasses = 'flex flex-col';
    
    if (isMobile) {
      return cn(baseClasses, 'gap-4');
    }
    if (isTablet) {
      return cn(baseClasses, 'gap-6');
    }
    return cn(baseClasses, 'gap-8');
  };

  const getClasses = () => {
    switch (variant) {
      case 'grid':
        return getGridClasses();
      case 'stack':
        return getStackClasses();
      default:
        return getContainerClasses();
    }
  };

  return (
    <div className={cn(getClasses(), className)}>
      {children}
    </div>
  );
};

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  padding = 'md'
}) => {
  const { isMobile } = useResponsive();

  const getPaddingClasses = () => {
    if (padding === 'none') return '';
    
    if (isMobile) {
      return {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-5'
      }[padding];
    }
    
    return {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }[padding];
  };

  return (
    <div className={cn(
      'bg-card text-card-foreground rounded-lg border shadow-sm',
      getPaddingClasses(),
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical' | 'auto';
  className?: string;
}

export const ResponsiveButtonGroup: React.FC<ResponsiveButtonGroupProps> = ({
  children,
  orientation = 'auto',
  className = ''
}) => {
  const { isMobile } = useResponsive();

  const getOrientationClasses = () => {
    if (orientation === 'vertical') {
      return 'flex flex-col gap-2';
    }
    if (orientation === 'horizontal') {
      return 'flex flex-row gap-2';
    }
    // auto orientation
    return isMobile ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2';
  };

  return (
    <div className={cn(getOrientationClasses(), className)}>
      {children}
    </div>
  );
};

interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body',
  className = ''
}) => {
  const { isMobile } = useResponsive();

  const getVariantClasses = () => {
    const variants = {
      h1: isMobile ? 'text-2xl font-bold' : 'text-3xl font-bold',
      h2: isMobile ? 'text-xl font-semibold' : 'text-2xl font-semibold',
      h3: isMobile ? 'text-lg font-medium' : 'text-xl font-medium',
      body: isMobile ? 'text-sm' : 'text-base',
      caption: isMobile ? 'text-xs text-muted-foreground' : 'text-sm text-muted-foreground'
    };
    
    return variants[variant];
  };

  const Component = variant.startsWith('h') ? variant as 'h1' | 'h2' | 'h3' : 'p';

  return (
    <Component className={cn(getVariantClasses(), className)}>
      {children}
    </Component>
  );
};