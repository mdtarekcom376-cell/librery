import React, { useState } from "react";

// The API falls back to this stock photo when a book has no cover; treat it as "no cover".
const STOCK_PLACEHOLDER_ID = "photo-1543002588";

// Deep, print-like tones for generated covers. Each book always gets the same one.
const COVER_TONES: [string, string][] = [
  ["#1E3A5F", "#2B5283"],
  ["#7A2E3A", "#A23B48"],
  ["#2F5D50", "#3E7A69"],
  ["#4B3869", "#664C8C"],
  ["#1F5F6B", "#2A7F8E"],
  ["#6B4423", "#8C5A2F"],
  ["#334155", "#475569"],
  ["#9A3412", "#C2410C"],
];

/** True when the URL points at an actual uploaded/linked cover image. */
export function hasRealCover(url?: string | null): boolean {
  if (!url) return false;
  const u = url.trim();
  if (u.startsWith("/api/public/img/") || u.startsWith("data:image/")) return true;
  return /^https?:\/\//.test(u) && !u.includes(STOCK_PLACEHOLDER_ID);
}

/** Stable gradient pair for a seed string (shared with tiles/avatars on the catalogue). */
export function coverTone(seed: string): [string, string] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COVER_TONES[h % COVER_TONES.length];
}

interface BookCoverProps {
  title: string;
  author?: string;
  imageUrl?: string | null;
  seed?: string;
  className?: string;
  eager?: boolean;
}

/**
 * Book cover that shows the real image when there is one, otherwise a generated
 * typographic cover (title + author on a stable colour), so the catalogue never
 * shows rows of identical placeholder logos. Sizes itself to its container.
 */
export default function BookCover({ title, author, imageUrl, seed, className = "", eager = false }: BookCoverProps) {
  const [failed, setFailed] = useState(false);
  const showImage = hasRealCover(imageUrl) && !failed;
  const [from, to] = coverTone(seed || title);

  return (
    <div className={`@container relative w-full h-full overflow-hidden bg-[#EEECEA] ${className}`}>
      {showImage ? (
        <img
          src={imageUrl!}
          alt={title}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col justify-between p-[9cqi] pl-[13cqi] text-white"
          style={{ background: `linear-gradient(155deg, ${from} 0%, ${to} 100%)` }}
          role="img"
          aria-label={title}
        >
          {/* spine shading + page edge */}
          <span className="absolute inset-y-0 left-0 w-[5cqi] bg-black/25" aria-hidden />
          <span className="absolute inset-y-0 left-[5cqi] w-px bg-white/15" aria-hidden />
          <span className="block h-[1.5cqi] w-[22cqi] rounded-full bg-white/50" aria-hidden />
          <p className="font-bold leading-[1.25] text-[11.5cqi] line-clamp-5 break-words">{title}</p>
          <div>
            <span className="block h-px w-[30cqi] bg-white/35 mb-[4cqi]" aria-hidden />
            <p className="text-[7.5cqi] leading-tight text-white/80 line-clamp-2">{author || "অক্ষর পাঠাগার"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
