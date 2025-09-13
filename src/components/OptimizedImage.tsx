import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  quality?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  width,
  height,
  lazy = true,
  quality = 80
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [error, setError] = useState(false);

  // Create WebP and fallback URLs
  const getOptimizedSrc = (originalSrc: string): string => {
    const ext = originalSrc.split('.').pop()?.toLowerCase();
    if (ext === 'jpeg' || ext === 'jpg' || ext === 'png') {
      // For production, you might want to use a CDN or image optimization service
      // For now, we'll use the original image but with loading optimization
      return originalSrc;
    }
    return originalSrc;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px'
      }
    );

    const element = document.getElementById(`img-${src.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [src, lazy]);

  // Set image source when in view
  useEffect(() => {
    if (isInView && !imageSrc) {
      setImageSrc(getOptimizedSrc(src));
    }
  }, [isInView, src, imageSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  const imageId = `img-${src.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div 
      id={imageId}
      className={`relative overflow-hidden ${placeholderClassName}`}
      style={{ width, height }}
    >
      {!isLoaded && !error && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}
      
      {error && (
        <div className={`absolute inset-0 bg-gray-200 flex items-center justify-center ${className}`}>
          <div className="text-gray-400 text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Image failed to load</span>
          </div>
        </div>
      )}
      
      {imageSrc && !error && (
        <img
          src={imageSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          width={width}
          height={height}
        />
      )}
    </div>
  );
};