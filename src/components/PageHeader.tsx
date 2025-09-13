import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ children, className = '' }) => {
  const isMobile = useIsMobile();

  return children ? (
    <div className={`mb-6 ${className}`}>
      {children}
    </div>
  ) : null;
};
