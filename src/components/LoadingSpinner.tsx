import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading...',
  showText = true,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        {showText && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
        )}
      </div>
    </div>
  );
};

interface FullPageLoadingProps {
  text?: string;
}

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  text = 'Loading application...',
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  );
};

interface PageLoadingProps {
  text?: string;
  className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  text = 'Loading...',
  className = 'py-12',
}) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};

interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const ButtonWithLoading: React.FC<ButtonLoadingProps> = ({
  isLoading,
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`relative ${className} ${
        isLoading || disabled ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

// Skeleton loading components
interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <Skeleton className="h-6 w-3/4 mb-4" />
      <SkeletonText lines={3} />
      <div className="mt-4 flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
};

export default LoadingSpinner;