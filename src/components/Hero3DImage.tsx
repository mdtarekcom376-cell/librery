import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

import heroImage from "../assets/images/hero-3d-stage.webp";
import fallbackImage from "../assets/images/akkhor_logo_1781456142605.jpg";

export default function Hero3DImage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Responsive: disable tilt on touch devices or reduced motion
  const [isHoverable, setIsHoverable] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");
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
  const springConfig = { damping: 24, stiffness: 120, mass: 0.9 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Transform constraints: tilt degrees
  const rotateX = useTransform(springY, [-1, 1], [6, -6]);
  const rotateY = useTransform(springX, [-1, 1], [-6, 6]);
  
  // Transform constraints for dynamic shadow/glow shift
  const glowX = useTransform(springX, [-1, 1], [-12, 12]);
  const glowY = useTransform(springY, [-1, 1], [-12, 12]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHoverable || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const relativeY = (e.clientY - rect.top) / rect.height;
    
    x.set(relativeX * 2 - 1);
    y.set(relativeY * 2 - 1);
  };

  const handleMouseLeave = () => {
    if (!isHoverable) return;
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center justify-center w-full min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1200px" }}
    >
      {/* 1. Ambient Background Light Flares & Glows */}
      <motion.div 
        className="absolute w-[115%] h-[115%] rounded-full blur-[70px] pointer-events-none"
        style={{
          background: "radial-gradient(circle at 60% 45%, rgba(191, 219, 254, 0.45) 0%, rgba(147, 197, 253, 0.2) 40%, transparent 70%)",
          x: glowX,
          y: glowY,
          zIndex: 0,
        }}
      />

      {/* Floating 3D Pearl Spheres */}
      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 26,
          height: 26,
          top: "8%",
          right: "2%",
          background: "radial-gradient(circle at 35% 32%, #FFFFFF 0%, #E2E8F0 50%, #94A3B8 100%)",
          boxShadow: "0 8px 20px -3px rgba(15, 23, 42, 0.18), inset -2px -2px 5px rgba(100, 116, 139, 0.4), inset 2px 2px 4px rgba(255, 255, 255, 0.9)",
          zIndex: 2,
        }}
        animate={{
          y: [6, -6, 6],
          x: [2, -2, 2],
        }}
        transition={{
          duration: 5.2,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 0.5,
        }}
      />

      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 22,
          height: 22,
          top: "26%",
          left: "-2%",
          background: "radial-gradient(circle at 35% 32%, #FFFFFF 0%, #E2E8F0 50%, #94A3B8 100%)",
          boxShadow: "0 8px 20px -3px rgba(15, 23, 42, 0.18), inset -2px -2px 5px rgba(100, 116, 139, 0.4), inset 2px 2px 4px rgba(255, 255, 255, 0.9)",
          zIndex: 2,
        }}
        animate={{
          y: [-6, 6, -6],
          x: [-2, 2, -2],
        }}
        transition={{
          duration: 4.8,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 14,
          height: 14,
          bottom: "12%",
          left: "6%",
          background: "radial-gradient(circle at 35% 32%, #FFFFFF 0%, #E2E8F0 50%, #94A3B8 100%)",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12), inset -1px -1px 3px rgba(100, 116, 139, 0.4)",
          zIndex: 25,
        }}
        animate={{
          y: [4, -5, 4],
        }}
        transition={{
          duration: 4.2,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 1.0,
        }}
      />

      {/* 2. The 3D Interactive Stage Container */}
      <motion.div
        className="relative z-10 w-full max-w-[480px] sm:max-w-[540px] md:max-w-[580px] lg:max-w-[620px] flex flex-col items-center justify-center cursor-default"
        style={{
          rotateX: isHoverable ? rotateX : 0,
          rotateY: isHoverable ? rotateY : 0,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Floating 3D Artwork Stage */}
        <motion.div
          className="relative z-20 w-full flex items-center justify-center"
          animate={{
            y: [-5, 5, -5],
          }}
          transition={{
            duration: 5,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          style={{ transform: "translateZ(20px)" }}
        >
          <img
            src={heroImage}
            alt="অক্ষর পাঠাগার 3D লোগো"
            className="w-full h-auto drop-shadow-[0_20px_35px_rgba(15,23,42,0.12)] object-contain select-none pointer-events-none"
            // @ts-ignore
            fetchPriority="high" 
            loading="eager"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = fallbackImage;
              target.classList.remove("drop-shadow-[0_20px_35px_rgba(15,23,42,0.12)]");
              target.classList.add("rounded-3xl", "shadow-2xl");
            }}
          />
        </motion.div>

        {/* Soft Warm Golden & Cyan Floor Underglow under the podium */}
        <motion.div 
          className="absolute -bottom-4 w-[92%] h-[60px] rounded-[100%] blur-2xl pointer-events-none z-1"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, rgba(56, 189, 248, 0.4) 0%, rgba(245, 158, 11, 0.18) 40%, transparent 75%)",
            x: glowX,
            y: glowY,
          }}
        />
      </motion.div>
    </div>
  );
}
