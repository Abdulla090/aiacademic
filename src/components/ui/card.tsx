import * as React from "react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border-2 bg-card text-card-foreground shadow-md",
        className
      )}
      style={{
        borderColor: 'hsl(265 60% 50% / 0.7)',
        ...style
      }}
      {...props}
    />
  );
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        className,
        isRTL ? "!text-right" : "!text-left"
      )}
      {...props}
    />
  );
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, style, ...props }, ref) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  return (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight block w-full",
        className,
        isRTL ? "!text-right" : "!text-left"
      )}
      style={{
        textAlign: isRTL ? 'right' : 'left',
        ...style
      }}
      {...props}
    />
  );
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  return (
    <p
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground",
        className,
        isRTL ? "!text-right" : "!text-left"
      )}
      {...props}
    />
  );
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  return (
    <div 
      ref={ref} 
      className={cn(
        "p-6 pt-0",
        className,
        isRTL ? "!text-right" : "!text-left"
      )} 
      {...props} 
    />
  );
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-6 pt-0",
        isRTL ? "flex-row-reverse" : "",
        className
      )}
      {...props}
    />
  );
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
