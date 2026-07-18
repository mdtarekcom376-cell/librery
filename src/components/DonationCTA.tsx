import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

interface DonationCTAProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  className?: string;
}

export default function DonationCTA({
  title = "আলো ছড়ানোর মিছিলে যোগাযোগ করুন",
  description,
  buttonLabel = "ডোনেট করুন",
  className = ""
}: DonationCTAProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative group ${className}`}
    >
      {/* Gradient border wrapper */}
      <div
        className="relative p-[1.5px] rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #EC4899, #F43F5E, #EC4899)",
          borderRadius: "12px",
        }}
      >
        {/* Inner dark card */}
        <div className="relative bg-[#1c1d23] rounded-[10.5px] p-5 overflow-hidden">
          {/* Decorative glow orbs */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#EC4899]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-28 h-28 rounded-full bg-[#F43F5E]/8 blur-3xl pointer-events-none" />

          {/* Shine overlay on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(244,63,94,0.04) 0%, transparent 50%)",
            }}
          />

          {/* Heading */}
          <h4 className="font-display-bn text-sm font-bold text-white/90 mb-3 relative z-10">
            {title}
          </h4>
          
          {/* Description */}
          {description && (
            <p className="font-body-bn text-xs text-white/70 mb-4 relative z-10 leading-relaxed">
              {description}
            </p>
          )}

          {/* Animated Donate Button */}
          <motion.a
            href="http://donat.okkhorpathagar.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 flex items-center justify-center gap-2 text-white px-5 py-2.5 rounded-lg font-ui text-sm font-bold w-full text-center cursor-pointer"
            style={{ textDecoration: "none" }}
            initial={{
              background: "linear-gradient(135deg, #EC4899, #E11D48, #BE123C)",
            }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 8px 32px rgba(225, 29, 72, 0.5), 0 0 40px rgba(244, 63, 94, 0.15)",
            }}
            whileTap={{ scale: 0.97 }}
            animate={{
              boxShadow: [
                "0 4px 20px rgba(225, 29, 72, 0.3)",
                "0 4px 32px rgba(225, 29, 72, 0.55), 0 0 24px rgba(244, 63, 94, 0.12)",
                "0 4px 20px rgba(225, 29, 72, 0.3)",
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
              size={16}
              className="text-white fill-white/80"
              strokeWidth={2}
            />
            {buttonLabel}
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}
