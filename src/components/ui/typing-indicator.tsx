import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TypingIndicator = ({ className, size = 'md' }: TypingIndicatorProps) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const gapClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2'
  };

  return (
    <div className={cn("flex items-center", gapClasses[size], className)}>
      <div 
        className={cn(
          "bg-primary rounded-full animate-pulse",
          sizeClasses[size]
        )}
        style={{
          animationDelay: '0ms',
          animationDuration: '1.4s'
        }}
      />
      <div 
        className={cn(
          "bg-primary rounded-full animate-pulse",
          sizeClasses[size]
        )}
        style={{
          animationDelay: '160ms',
          animationDuration: '1.4s'
        }}
      />
      <div 
        className={cn(
          "bg-primary rounded-full animate-pulse",
          sizeClasses[size]
        )}
        style={{
          animationDelay: '320ms',
          animationDuration: '1.4s'
        }}
      />
    </div>
  );
};
