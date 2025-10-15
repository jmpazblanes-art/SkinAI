import React, { useState, useEffect, useRef } from 'react';
import Skeleton from './Skeleton';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && src) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        },
        { rootMargin: "200px" } // Load 200px before it's in view
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [src]);

  // If no src, just render the skeleton with the correct dimensions
  if (!src) {
    return <Skeleton className={className} />;
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Skeleton is visible underneath */}
      <div className={`transition-opacity duration-300 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}>
        <Skeleton className="w-full h-full" />
      </div>

      {/* Actual image is absolutely positioned on top and fades in */}
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy" // Native fallback
          {...props} // This will pass object-cover etc.
        />
      )}
    </div>
  );
};

export default LazyImage;
