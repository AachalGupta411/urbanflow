import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export default function OptimizedImage({
  src,
  alt,
  className,
  loading = 'lazy',
}: OptimizedImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-100 via-blue-50 to-slate-100',
          className
        )}
        role="img"
        aria-label={alt}
      >
        <span className="px-4 text-center text-sm font-medium text-slate-500">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
