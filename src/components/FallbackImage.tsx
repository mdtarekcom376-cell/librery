import React, { useEffect, useState } from "react";
import type { ImgHTMLAttributes } from "react";
import fallbackImage from "../assets/images/akkhor_logo_1781456142605.jpg";

type FallbackImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

/**
 * Image element that replaces missing or broken remote images with the library logo.
 * Lazy by default: list pages render hundreds of covers, each a separate request.
 */
export default function FallbackImage({ src, fallbackSrc = fallbackImage, onError, loading = "lazy", decoding = "async", ...props }: FallbackImageProps) {
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

  return <img loading={loading} decoding={decoding} {...props} src={currentSrc} onError={handleError} />;
}
