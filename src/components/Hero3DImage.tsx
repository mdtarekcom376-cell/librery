import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

// The path to the uploaded WebP image. 
// NOTE: Replace this placeholder with the actual optimized image file path once uploaded.
import heroImage from "../assets/images/hero-3d-book.webp";
import fallbackImage from "../assets/images/akkhor_logo_1781456142605.jpg";

export default function Hero3DImage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Responsive: disable tilt on touch devices or reduced motion
  const [isHoverable, setIsHoverable] = useState(true);

  useEffect(() => {
    // Check if the device has a coarse pointer (touch)
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    // Check if the user prefers reduced motion
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateCapabilities = () => {
      if (mediaQuery.matches || reducedMotionQuery.matches) {
        setIsHoverable(false);
      } else {
        setIsHoverable(true);
      }
    };

    updateCapabilities();
    mediaQuery.addEventListener("change", updateCapabilities);
    reducedMotionQuery.addEventListener("change", updateCapabilities);
    
    return () => {
      mediaQuery.removeEventListener("change", updateCapabilities);
      reducedMotionQuery.removeEventListener("change", updateCapabilities);
    };
  }, []);

  // Motion values for cursor position (-1 to 1)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for the tilt
  const springConfig = { damping: 20, stiffness: 150, mass: 1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Transform constraints: max tilt 12 degrees
  const rotateX = useTransform(springY, [-1, 1], [12, -12]);
  const rotateY = useTransform(springX, [-1, 1], [-12, 12]);
  
  // Transform constraints for dynamic shadow (moves slightly opposite to the tilt)
  const shadowX = useTransform(springX, [-1, 1], [20, -20]);
  const shadowY = useTransform(springY, [-1, 1], [20, -20]);

  // Transform constraints for dynamic glow brightness
  // Brightest when cursor is near the center, dims when away
  const glowOpacity = useTransform(
    () => 0.5 + (1 - (Math.abs(springX.get()) + Math.abs(springY.get())) / 2) * 0.5
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHoverable || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate relative position (-1 to 1)
    const relativeX = (e.clientX - rect.left) / rect.width;
    const relativeY = (e.clientY - rect.top) / rect.height;
    
    x.set(relativeX * 2 - 1);
    y.set(relativeY * 2 - 1);
  };

  const handleMouseLeave = () => {
    if (!isHoverable) return;
    // Reset to center smoothly
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full min-h-[300px] z-10"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }}
    >
      {/* Background radial glow */}
      <motion.div
        className="absolute w-[120%] h-[120%] rounded-full blur-3xl pointer-events-none transition-opacity duration-300"
        style={{
          background: "radial-gradient(circle, rgba(28,143,224,0.3) 0%, rgba(247,148,29,0.1) 50%, transparent 70%)",
          opacity: glowOpacity,
          zIndex: 0,
        }}
      />

      {/* Dynamic drop shadow on the "floor" */}
      <motion.div
        className="absolute w-[60%] h-8 bottom-4 rounded-[100%] blur-xl pointer-events-none"
        style={{
          background: "rgba(22, 35, 63, 0.5)",
          x: shadowX,
          y: shadowY,
          scale: 0.8,
          zIndex: 1,
        }}
        animate={{
          scale: [0.8, 1, 0.8],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {/* The 3D Image Container */}
      <motion.div
        className="relative z-10 w-full max-w-[320px] md:max-w-md lg:max-w-lg cursor-default"
        style={{
          rotateX: isHoverable ? rotateX : 0,
          rotateY: isHoverable ? rotateY : 0,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        animate={{
          y: [-15, 15, -15],
        }}
        transition={{
          duration: 5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <img
          src={heroImage}
          alt="অক্ষর পাঠাগার 3D লোগো"
          className="w-full h-auto drop-shadow-2xl object-contain"
          // @ts-ignore
          fetchPriority="high" 
          loading="eager"
          // Fallback image handling just in case the webp isn't there yet
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = fallbackImage;
            target.classList.remove("drop-shadow-2xl");
            target.classList.add("rounded-3xl", "shadow-2xl");
          }}
        />
      </motion.div>
    </div>
  );
}
