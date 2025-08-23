import { FC } from 'react';

interface LoaderProps {
  size?: number;
  className?: string;
}

export const Loader: FC<LoaderProps> = ({ size = 24, className = '' }) => (
  <div
    style={{
      width: size,
      height: size,
      border: '2px solid currentColor',
      borderRightColor: 'transparent',
    }}
    className={`animate-spin rounded-full ${className}`}
    role="status"
    aria-live="polite"
  >
    <span className="sr-only">Loading...</span>
  </div>
);