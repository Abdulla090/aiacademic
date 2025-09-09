import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ children, className = '' }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    // On mobile, don't show sidebar trigger since we have bottom nav
    return children ? (
      <div className={`mb-6 ${className}`}>
        {children}
      </div>
    ) : null;
  }

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <SidebarTrigger />
      </div>
      {children}
    </div>
  );
};
