import React, { useEffect, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import fallbackImage from "../assets/images/akkhor_logo_1781456142605.jpg";

type FallbackImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

/** Image element that replaces missing or broken remote images with the library logo. */
export default function FallbackImage({ src, fallbackSrc = fallbackImage, onError, ...props }: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    onError?.(event);
  };

  return <img {...props} src={currentSrc} onError={handleError} />;
}
