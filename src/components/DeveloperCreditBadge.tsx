import React from "react";

interface DeveloperCreditBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export default function DeveloperCreditBadge({
  className = "",
  size = "md",
}: DeveloperCreditBadgeProps) {
  const isSm = size === "sm";

  return (
    <a
      href="https://artx.techvrs.com/"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center bg-white border border-slate-200/90 hover:border-[#FF5500]/60 rounded-full shadow-2xs hover:shadow-xs transition-all duration-200 group cursor-pointer select-none ${
        isSm ? "px-3.5 py-1 gap-1.5" : "px-4.5 py-1.5 gap-1.5"
      } ${className}`}
      title="Developed by ArtX"
    >
      <span
        className={`text-[#334155] font-sans font-medium tracking-tight transition-colors group-hover:text-slate-900 ${
          isSm ? "text-[11px]" : "text-xs"
        }`}
      >
        developed by
      </span>
      <span
        className={`font-sans font-bold text-[#0F172A] tracking-tight ${
          isSm ? "text-xs" : "text-xs"
        }`}
      >
        Art<span className="text-[#FF5500] font-extrabold transition-colors group-hover:text-[#ff3d00]">X</span>
      </span>
    </a>
  );
}
