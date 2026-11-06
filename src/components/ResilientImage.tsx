import React, { useState } from 'react';
import { BrandEmblem } from './BrandEmblem';

interface ResilientImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackTitle?: string;
  containerClassName?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  fallbackTitle,
  className = '',
  containerClassName = '',
  loading = 'lazy',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EADBC0] via-[#F5EBD6] to-[#DFCCA7] text-[#1B3B22] p-6 text-center select-none ${containerClassName} ${className}`}
        role="img"
        aria-label={alt}
      >
        <BrandEmblem variant="dark" className="w-12 h-12 mb-2 opacity-80" />
        <span className="font-display text-sm font-semibold tracking-tight text-[#1E241E]">
          {fallbackTitle || 'Kadaknath Poultry Farm'}
        </span>
        <span className="text-xs text-[#4A544A] mt-0.5">
          Bhoshana, Shivli Road
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      className={`transition-opacity duration-500 ${
        isLoaded ? 'opacity-100' : 'opacity-90'
      } ${className}`}
      {...rest}
    />
  );
};
