import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsivePageWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  language?: string;
  className?: string;
}

export const ResponsivePageWrapper: React.FC<ResponsivePageWrapperProps> = ({
  children,
  title,
  subtitle,
  icon,
  language = 'en',
  className = ''
}) => {
  return (
    <div className={cn('min-h-screen bg-gradient-subtle', className)}>
      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="p-2 sm:p-3 bg-gradient-primary rounded-xl text-primary-foreground">
            {icon}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

interface ResponsiveFormLayoutProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const ResponsiveFormLayout: React.FC<ResponsiveFormLayoutProps> = ({
  children,
  className = '',
  orientation = 'horizontal'
}) => {
  const orientationClasses = {
    vertical: 'flex flex-col gap-4 sm:gap-6',
    horizontal: 'grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2'
  };

  return (
    <div className={cn(orientationClasses[orientation], className)}>
      {children}
    </div>
  );
};

interface ResponsiveCardWrapperProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export const ResponsiveCardWrapper: React.FC<ResponsiveCardWrapperProps> = ({
  children,
  title,
  icon,
  className = '',
  headerActions
}) => {
  return (
    <div className={cn('bg-card text-card-foreground rounded-lg border shadow-sm', className)}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            {icon && <span className="h-5 w-5 flex-shrink-0">{icon}</span>}
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

interface ResponsiveTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  language?: string;
  minHeight?: 'sm' | 'md' | 'lg' | 'xl';
  maxHeight?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ResponsiveTextArea: React.FC<ResponsiveTextAreaProps> = ({
  value,
  onChange,
  placeholder = '',
  className = '',
  language = 'en',
  minHeight = 'md',
  maxHeight = 'xl'
}) => {
  const heightClasses = {
    sm: 'min-h-32 max-h-48',
    md: 'min-h-48 max-h-64',
    lg: 'min-h-64 max-h-80',
    xl: 'min-h-80 max-h-96'
  };

  const mobileHeightClasses = {
    sm: 'min-h-24 max-h-32',
    md: 'min-h-32 max-h-48',
    lg: 'min-h-48 max-h-64',
    xl: 'min-h-64 max-h-80'
  };

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full p-3 text-sm border border-input bg-background rounded-md',
        'resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
        'transition-colors placeholder:text-muted-foreground',
        `sm:${heightClasses[minHeight]} sm:${heightClasses[maxHeight]}`,
        `${mobileHeightClasses[minHeight]} ${mobileHeightClasses[maxHeight]}`,
        'sm:text-base sm:p-4',
        className
      )}
      dir={language === 'ku' || language === 'ar' ? 'rtl' : 'ltr'}
    />
  );
};

interface ResponsiveButtonRowProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'auto' | 'horizontal' | 'vertical';
}

export const ResponsiveButtonRow: React.FC<ResponsiveButtonRowProps> = ({
  children,
  className = '',
  orientation = 'auto'
}) => {
  const orientationClasses = {
    auto: 'flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3',
    horizontal: 'flex flex-row flex-wrap gap-2 sm:gap-3',
    vertical: 'flex flex-col gap-2'
  };

  return (
    <div className={cn(orientationClasses[orientation], className)}>
      {children}
    </div>
  );
};

interface ResponsiveOutputAreaProps {
  children: React.ReactNode;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  maxHeight?: boolean;
}

export const ResponsiveOutputArea: React.FC<ResponsiveOutputAreaProps> = ({
  children,
  loading = false,
  loadingText = 'Loading...',
  emptyText = 'No content',
  emptyIcon,
  className = '',
  maxHeight = true
}) => {
  const hasContent = React.Children.count(children) > 0;

  return (
    <div className={cn(
      'w-full border rounded-md bg-background',
      maxHeight && 'max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto',
      className
    )}>
      {loading ? (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-muted-foreground">{loadingText}</p>
          </div>
        </div>
      ) : hasContent ? (
        <div className="p-3 sm:p-4">
          {children}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            {emptyIcon && (
              <div className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground">
                {emptyIcon}
              </div>
            )}
            <p className="text-sm sm:text-base text-muted-foreground">{emptyText}</p>
          </div>
        </div>
      )}
    </div>
  );
};