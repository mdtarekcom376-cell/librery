import { apiClient } from "../api";
import { Book } from "../types";

export interface Catalog {
  books: Book[];
  groups: string[];
  popular: { id: string; reads: number; fallback: Book }[];
}

// Survives navigation between the catalogue and book pages, so going back is instant
// and the global scroll restoration lands on the same spot. One shared in-flight request
// means a remount (or StrictMode's double effect) never drops a finished load.
let catalogCache: Catalog | null = null;
let catalogRequest: Promise<Catalog> | null = null;

export const getCachedCatalog = () => catalogCache;

export function loadCatalog(): Promise<Catalog> {
  if (!catalogRequest) {
    catalogRequest = (async () => {
      const [booksRes, groupsRes, popularRes] = await Promise.all([
        apiClient.get("/public/books?limit=1000"),
        apiClient.get("/public/groups").catch(() => null),
        apiClient.get("/public/leaderboard/books").catch(() => null),
      ]);
      const books: Book[] = Array.isArray(booksRes?.books) ? booksRes.books : Array.isArray(booksRes) ? booksRes : [];
      const groups: string[] = Array.isArray(groupsRes?.groups) ? groupsRes.groups : [];
      const popular = (Array.isArray(popularRes?.leaderboard) ? popularRes.leaderboard : []).map((p: any) => ({
        id: String(p.id),
        reads: Number(p.count) || 0,
        fallback: {
          id: String(p.id), code: p.code, name: p.name, author: p.author, publisher: "",
          imageUrl: p.imageUrl, status: "Available", group: p.group,
        } as Book,
      }));
      catalogCache = { books, groups, popular };
      return catalogCache;
    })().catch((err) => {
      catalogRequest = null; // allow a retry on the next visit
      throw err;
    });
  }
  return catalogRequest;
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const toBn = (n: number | string) => String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
export const toAsciiDigits = (s: string) => s.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));

/** Prices arrive as DECIMAL strings ("850.00"); show "৳৮৫০", keeping real fractions. */
export const formatPrice = (p: number | string) => {
  const n = Number(p);
  return Number.isFinite(n) ? `৳${toBn(Number.isInteger(n) ? n : n.toFixed(2))}` : "";
};

export const PLACEHOLDER_AUTHORS = new Set(["", "উল্লেখ নেই", "নাই", "অজ্ঞাত", "unknown", "n/a"]);
