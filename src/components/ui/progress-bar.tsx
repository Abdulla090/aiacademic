import { memo } from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
  variant?: 'default' | 'gradient' | 'striped';
}

export const ProgressBar = memo(({ 
  current, 
  total, 
  showLabel = true,
  className = '',
  variant = 'gradient'
}: ProgressBarProps) => {
  const percentage = Math.min((current / total) * 100, 100);

  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500';
      case 'striped':
        return 'bg-blue-500 bg-striped';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-2 text-sm">
          <span className="font-medium sorani-text">پێشکەوتن</span>
          <span className="font-bold">{current} / {total}</span>
        </div>
      )}
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full ${getVariantClasses()} relative transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        >
          {variant === 'gradient' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
      {showLabel && (
        <div className="text-right mt-1 text-xs text-gray-600">
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
});
