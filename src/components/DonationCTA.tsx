import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

interface DonationCTAProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function DonationCTA({
  title = "আলো ছড়ানোর মিছিলে যুক্ত হন",
  description,
  buttonLabel = "Donation",
  className = "",
  style
}: DonationCTAProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative group shrink-0 ${className}`}
      style={style || { width: "219px", height: "141px" }}
    >
      {/* Gradient border wrapper */}
      <div
        className="relative p-[1px] rounded-xl h-full flex flex-col"
        style={{
          background: "linear-gradient(135deg, #EC4899, #F43F5E, #EC4899)",
          borderRadius: "12px",
        }}
      >
        {/* Inner dark card */}
        <div className="relative bg-[#1c1d23] rounded-[11px] p-3 overflow-hidden h-full flex flex-col justify-between">
          {/* Decorative glow orbs */}
          <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-[#EC4899]/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-16 h-16 rounded-full bg-[#F43F5E]/8 blur-2xl pointer-events-none" />

          {/* Shine overlay on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(244,63,94,0.04) 0%, transparent 50%)",
            }}
          />

          <div>
            {/* Heading */}
            <h4 className="font-display-bn text-[12px] font-bold text-white/95 mb-1.5 relative z-10 leading-tight">
              {title}
            </h4>
            
            {/* Description */}
            {description && (
              <p className="font-body-bn text-[9px] text-white/70 relative z-10 leading-relaxed line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Animated Donate Button */}
          <motion.a
            href="http://donat.okkhorpathagar.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex items-center justify-center gap-1.5 text-white px-2 py-1.5 mt-2 rounded font-ui text-[10.5px] leading-none whitespace-nowrap font-bold w-full text-center cursor-pointer"
            style={{ textDecoration: "none" }}
            initial={{
              background: "linear-gradient(135deg, #EC4899, #E11D48, #BE123C)",
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 16px rgba(225, 29, 72, 0.4)",
            }}
            whileTap={{ scale: 0.98 }}
            animate={{
              boxShadow: [
                "0 2px 10px rgba(225, 29, 72, 0.2)",
                "0 2px 16px rgba(225, 29, 72, 0.4)",
                "0 2px 10px rgba(225, 29, 72, 0.2)",
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <Heart
              size={12}
              className="text-white fill-white/80"
              strokeWidth={2.5}
            />
            {buttonLabel}
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}
