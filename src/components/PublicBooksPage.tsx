import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
  Library,
  PenLine,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Book } from "../types";
import BookCover, { coverTone, hasRealCover } from "./BookCover";
import { PLACEHOLDER_AUTHORS, formatPrice, getCachedCatalog, loadCatalog, toAsciiDigits, toBn } from "../lib/catalog";

interface PublicBooksPageProps {
  onBack: () => void;
  logoBase64?: string;
  onBookSelect?: (book: Book) => void;
}

type SortKey = "new" | "name" | "price-asc" | "price-desc";

interface PopularEntry {
  book: Book;
  reads: number;
}

const PAGE_SIZE = 24;
const SORT_LABELS: Record<SortKey, string> = {
  new: "নতুন আগে",
  name: "নাম (অ → ঔ)",
  "price-asc": "মূল্য: কম → বেশি",
  "price-desc": "মূল্য: বেশি → কম",
};

function firstGrapheme(text: string): string {
  const seg = (Intl as any).Segmenter ? new (Intl as any).Segmenter("bn", { granularity: "grapheme" }) : null;
  if (seg) return seg.segment(text)[Symbol.iterator]().next().value?.segment || "";
  return Array.from(text)[0] || "";
}

export default function PublicBooksPage({ onBack, logoBase64, onBookSelect }: PublicBooksPageProps) {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const group = params.get("group") || "";
  const author = params.get("author") || "";
  const onlyAvailable = params.get("status") === "available";
  const sort = (params.get("sort") as SortKey) || "new";
  const viewAll = params.get("view") === "all";
  const isBrowsing = !q && !group && !author && !onlyAvailable && !viewAll && !params.get("sort");

  const cached = getCachedCatalog();
  const [books, setBooks] = useState<Book[]>(cached?.books || []);
  const [groups, setGroups] = useState<string[]>(cached?.groups || []);
  const [popularRaw, setPopularRaw] = useState(cached?.popular || []);
  const [loading, setLoading] = useState(!cached);
  const [searchInput, setSearchInput] = useState(q);

  const updateParams = (patch: Record<string, string | null>, replace = false) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setParams(next, { replace });
  };
  const resetToBrowse = () => {
    setSearchInput("");
    setParams(new URLSearchParams());
  };

  useEffect(() => {
    if (getCachedCatalog()) return;
    let cancelled = false;
    loadCatalog()
      .then((c) => {
        if (cancelled) return;
        setBooks(c.books);
        setGroups(c.groups);
        setPopularRaw(c.popular);
      })
      .catch((err) => console.error("Failed to load books for public view:", err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Keep the box in sync when the URL changes (back/forward, chip clicks)…
  useEffect(() => { setSearchInput(q); }, [q]);
  // …and push typing into the URL after a short pause.
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === q) return;
    const t = setTimeout(() => updateParams({ q: trimmed || null }, true), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // ---------- Derived catalogue data ----------
  const corners = useMemo(() => {
    const byGroup = new Map<string, Book[]>();
    for (const g of groups) if (g?.trim()) byGroup.set(g, []);
    for (const b of books) {
      if (!b.group?.trim()) continue;
      if (!byGroup.has(b.group)) byGroup.set(b.group, []);
      byGroup.get(b.group)!.push(b);
    }
    return Array.from(byGroup.entries())
      .map(([name, list]) => ({ name, books: list }))
      .filter((c) => c.books.length > 0)
      .sort((a, b) => b.books.length - a.books.length);
  }, [books, groups]);

  const authorStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of books) {
      const name = (b.author || "").trim();
      if (PLACEHOLDER_AUTHORS.has(name.toLowerCase())) continue;
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [books]);

  const popular: PopularEntry[] = useMemo(() => {
    const byId = new Map(books.map((b) => [b.id, b]));
    return popularRaw.map((p) => ({ book: byId.get(p.id) || p.fallback, reads: p.reads }));
  }, [books, popularRaw]);

  const todaysPicks = useMemo(() => {
    const withCovers = books.filter((b) => hasRealCover(b.imageUrl));
    if (withCovers.length === 0) return [];
    const day = Math.floor(Date.now() / 86_400_000);
    const start = (day * 7) % withCovers.length;
    return Array.from({ length: Math.min(12, withCovers.length) }, (_, i) => withCovers[(start + i) % withCovers.length]);
  }, [books]);

  const availableCount = useMemo(() => books.filter((b) => b.status === "Available").length, [books]);

  const results = useMemo(() => {
    const text = toAsciiDigits(q.trim().toLowerCase());
    const list = books.filter((b) => {
      if (group && b.group !== group) return false;
      if (author && (b.author || "").trim() !== author) return false;
      if (onlyAvailable && b.status !== "Available") return false;
      if (!text) return true;
      return [b.name, b.code, b.author, b.publisher, b.group].some((f) => (f || "").toLowerCase().includes(text));
    });
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "bn"));
    else if (sort === "price-asc") list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sort === "price-desc") list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    return list;
  }, [books, q, group, author, onlyAvailable, sort]);

  // "Load more" count is remembered per filter so coming back from a book keeps the list length.
  const filterKey = `booksVisible:${params.toString()}`;
  const [visible, setVisible] = useState(PAGE_SIZE);
  useEffect(() => {
    let saved = PAGE_SIZE;
    try { saved = Number(sessionStorage.getItem(filterKey)) || PAGE_SIZE; } catch {}
    setVisible(saved);
  }, [filterKey]);
  const showMore = () => {
    const next = visible + PAGE_SIZE;
    setVisible(next);
    try { sessionStorage.setItem(filterKey, String(next)); } catch {}
  };

  const selectBook = (book: Book) => onBookSelect?.(book);

  // On phones the corner chips scroll sideways; bring the selected one into view
  // (horizontally only — never move the page).
  const chipRowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = chipRowRef.current;
    const chip = row?.querySelector<HTMLElement>("[data-active='true']");
    if (row && chip && row.scrollWidth > row.clientWidth) {
      row.scrollLeft = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2;
    }
  }, [group, loading, isBrowsing]);

  const resultsTitle = author
    ? `${author} — এর বই`
    : group
      ? group
      : q
        ? `“${q}” — খোঁজের ফলাফল`
        : onlyAvailable
          ? "এখন পড়া যাবে এমন বই"
          : "পুরো সংগ্রহ";

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#22242A]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#22242A]/95 backdrop-blur-md border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 md:px-8 h-14">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors border border-white/15 text-white/80 hover:bg-white/10 hover:text-white"
              title="হোম পেজে ফিরে যান"
              aria-label="হোম পেজে ফিরে যান"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">হোম পেজ</span>
            </button>
            <button onClick={resetToBrowse} className="flex items-center gap-2.5 min-w-0 text-left" aria-label="বইয়ের ভুবন">
              {logoBase64 && (
                <img src={logoBase64} alt="অক্ষর পাঠাগার লোগো" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm md:text-base font-bold leading-tight truncate">বইয়ের ভুবন</p>
                <p className="text-[10px] text-white/50 leading-tight">Akkhor Library Catalog</p>
              </div>
            </button>
          </div>
          {!isBrowsing && (
            <button
              onClick={resetToBrowse}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white"
            >
              <Library size={14} /> সব বিভাগ
            </button>
          )}
        </div>
      </header>

      {/* Hero / search band — the search box keeps the same position in both modes so typing never loses focus */}
      <section className="relative overflow-hidden bg-[#22242A] text-white">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#FF6B6B]/25 blur-3xl pointer-events-none" aria-hidden />
        <div className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full bg-[#6366F1]/20 blur-3xl pointer-events-none" aria-hidden />
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }}
          aria-hidden
        />

        <div className={`relative max-w-7xl mx-auto px-4 md:px-8 ${isBrowsing ? "pt-8 pb-10 md:pt-14 md:pb-16" : "pt-5 pb-6 md:pt-8 md:pb-8"}`}>
          {isBrowsing ? (
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#FF6B6B]">
                <BookOpen size={14} /> অক্ষর পাঠাগার · অনলাইন ক্যাটালগ
              </p>
              <h1 className="mt-3 text-[28px] leading-tight md:text-5xl font-black">পছন্দের বইটি খুঁজে নিন</h1>
              <p className="mt-3 text-sm md:text-base text-white/65 leading-relaxed">
                {books.length > 0
                  ? `${toBn(books.length)}টি বই, ${toBn(authorStats.length)} জন লেখক — নাম, লেখক, কোড বা প্রকাশনী দিয়ে খুঁজুন।`
                  : "নাম, লেখক, কোড বা প্রকাশনী দিয়ে খুঁজুন।"}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-white/60">
              <button onClick={resetToBrowse} className="inline-flex items-center gap-1 hover:text-white">
                <ArrowLeft size={13} /> বইয়ের ভুবন
              </button>
              <ChevronRight size={12} />
              <span className="text-white/90 truncate">{resultsTitle}</span>
            </div>
          )}

          <div className={`relative ${isBrowsing ? "mt-6 md:mt-8 max-w-2xl" : "mt-3"}`}>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B70] pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") updateParams({ q: searchInput.trim() || null }, true);
              }}
              placeholder="বই, লেখক, কোড বা প্রকাশনী…"
              aria-label="বই খুঁজুন"
              className="[&::-webkit-search-cancel-button]:appearance-none w-full h-12 md:h-14 pl-12 pr-11 rounded-2xl bg-white text-[#22242A] text-sm md:text-base font-semibold placeholder:text-[#8E8E93] placeholder:font-normal shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] focus:outline-none focus:ring-4 focus:ring-[#FF6B6B]/30"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); updateParams({ q: null }, true); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-[#6B6B70] hover:bg-[#F5F3EF]"
                aria-label="খোঁজ মুছুন"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {isBrowsing ? (
            <>
              {authorStats.length > 0 && (
                <div className="mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                  <span className="shrink-0 text-xs text-white/50">জনপ্রিয় খোঁজ:</span>
                  {authorStats.slice(0, 5).map(([name]) => (
                    <button
                      key={name}
                      onClick={() => updateParams({ author: name })}
                      className="shrink-0 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/15"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8 md:mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
                {[
                  { icon: Library, value: books.length, label: "মোট বই" },
                  { icon: CheckCircle2, value: availableCount, label: "এখন উপলব্ধ" },
                  { icon: Users, value: authorStats.length, label: "লেখক" },
                  { icon: Layers, value: corners.length, label: "কর্নার" },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
                    <Icon size={16} className="text-[#FF6B6B]" />
                    <p className="mt-2 text-xl md:text-2xl font-black leading-none">{loading ? "—" : toBn(value)}</p>
                    <p className="mt-1 text-[11px] text-white/55">{label}</p>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {loading ? (
          <LoadingShelves />
        ) : isBrowsing ? (
          <div className="space-y-12 md:space-y-16">
            {books.length > 0 && (
              <section>
                <SectionHeader
                  icon={Sparkles}
                  title="নতুন সংযোজন"
                  subtitle="সম্প্রতি সংগ্রহে যুক্ত হওয়া বই"
                  action={{ label: "সব দেখুন", onClick: () => updateParams({ view: "all" }) }}
                />
                <Shelf>
                  {books.slice(0, 12).map((b, i) => (
                    <ShelfItem key={b.id}>
                      <BookCard book={b} onSelect={selectBook} eager={i < 4} />
                    </ShelfItem>
                  ))}
                </Shelf>
              </section>
            )}

            {popular.length > 0 && (
              <section>
                <SectionHeader icon={Flame} title="সবচেয়ে বেশি পড়া" subtitle="সদস্যরা যে বইগুলো সবচেয়ে বেশি ধার নিয়েছেন" />
                <Shelf>
                  {popular.map(({ book, reads }, i) => (
                    <ShelfItem key={book.id}>
                      <BookCard book={book} onSelect={selectBook} rank={i + 1} reads={reads} />
                    </ShelfItem>
                  ))}
                </Shelf>
              </section>
            )}

            {corners.length > 0 && (
              <section>
                <SectionHeader icon={Layers} title="কর্নার ও সংগ্রহ" subtitle="বিষয় ও লেখকভিত্তিক বিশেষ সংগ্রহ" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {corners.map((c) => (
                    <CornerTile key={c.name} name={c.name} books={c.books} onClick={() => updateParams({ group: c.name })} />
                  ))}
                </div>
              </section>
            )}

            {authorStats.length > 0 && (
              <section>
                <SectionHeader icon={PenLine} title="জনপ্রিয় লেখক" subtitle="যাঁদের বই আমাদের সংগ্রহে সবচেয়ে বেশি" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {authorStats.slice(0, 8).map(([name, count]) => (
                    <AuthorTile key={name} name={name} count={count} onClick={() => updateParams({ author: name })} />
                  ))}
                </div>
              </section>
            )}

            {todaysPicks.length > 0 && (
              <section>
                <SectionHeader icon={BookOpen} title="আজকের বাছাই" subtitle="প্রতিদিন নতুন কিছু বই — আজ এগুলো দেখে নিন" />
                <Shelf>
                  {todaysPicks.map((b) => (
                    <ShelfItem key={b.id}>
                      <BookCard book={b} onSelect={selectBook} />
                    </ShelfItem>
                  ))}
                </Shelf>
              </section>
            )}

            {books.length > 0 && (
              <section className="relative overflow-hidden rounded-3xl bg-[#22242A] text-white px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-[#FF6B6B]/25 blur-3xl pointer-events-none" aria-hidden />
                <div className="relative">
                  <p className="text-xl md:text-2xl font-black">পুরো সংগ্রহ ঘুরে দেখুন</p>
                  <p className="mt-1 text-sm text-white/65">
                    {toBn(books.length)}টি বই — নাম, মূল্য বা নতুনত্ব অনুযায়ী সাজিয়ে দেখুন।
                  </p>
                </div>
                <button
                  onClick={() => updateParams({ view: "all" })}
                  className="relative inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B6B] px-5 py-3 text-sm font-bold text-white hover:bg-[#ff5252] transition-colors"
                >
                  সব বই দেখুন <ArrowRight size={16} />
                </button>
              </section>
            )}

            {books.length === 0 && <EmptyState title="এই মুহূর্তে কোনো বই দেখানো যাচ্ছে না" hint="একটু পরে আবার চেষ্টা করুন।" />}
          </div>
        ) : (
          <div>
            {/* Results toolbar */}
            <div className="flex flex-col gap-3 md:gap-4 mb-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl md:text-3xl font-black leading-tight break-words">{resultsTitle}</h2>
                  <p className="mt-1 text-sm text-[#6B6B70]">{toBn(results.length)}টি বই পাওয়া গেছে</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="flex shrink-0 rounded-xl bg-white border border-[#E5E5EA] p-1" role="group" aria-label="স্ট্যাটাস">
                    <button
                      onClick={() => updateParams({ status: null })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${!onlyAvailable ? "bg-[#22242A] text-white" : "text-[#6B6B70]"}`}
                    >
                      সব
                    </button>
                    <button
                      onClick={() => updateParams({ status: "available" })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${onlyAvailable ? "bg-emerald-600 text-white" : "text-[#6B6B70]"}`}
                    >
                      উপলব্ধ
                    </button>
                  </div>
                  <label className="relative flex-1 sm:flex-none">
                    <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B70] pointer-events-none" />
                    <select
                      value={sort}
                      onChange={(e) => updateParams({ sort: e.target.value === "new" ? null : e.target.value, view: "all" })}
                      aria-label="সাজানোর ক্রম"
                      className="w-full sm:w-auto appearance-none pl-8 pr-8 py-2.5 rounded-xl bg-white border border-[#E5E5EA] text-xs font-bold text-[#22242A] focus:outline-none focus:border-[#22242A] cursor-pointer"
                    >
                      {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                        <option key={k} value={k}>{SORT_LABELS[k]}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[#6B6B70] pointer-events-none" />
                  </label>
                </div>
              </div>

              {/* Corner chips + active filters */}
              <div
                ref={chipRowRef}
                className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible"
              >
                {author && (
                  <FilterChip active onClick={() => updateParams({ author: null })} removable>
                    লেখক: {author}
                  </FilterChip>
                )}
                <FilterChip active={!group} onClick={() => updateParams({ group: null })}>সব কর্নার</FilterChip>
                {corners.map((c) => (
                  <FilterChip key={c.name} active={group === c.name} onClick={() => updateParams({ group: group === c.name ? null : c.name })}>
                    {c.name} <span className="opacity-60">{toBn(c.books.length)}</span>
                  </FilterChip>
                ))}
              </div>
            </div>

            {results.length === 0 ? (
              <EmptyState
                title="কোনো বই পাওয়া যায়নি"
                hint="অন্য শব্দে খুঁজে দেখুন, অথবা ফিল্টার সরিয়ে দিন।"
                action={{ label: "সব ফিল্টার মুছুন", onClick: resetToBrowse }}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7 md:gap-x-5 md:gap-y-9">
                  {results.slice(0, visible).map((b, i) => (
                    <BookCard key={b.id} book={b} onSelect={selectBook} eager={i < 6} />
                  ))}
                </div>
                {visible < results.length && (
                  <div className="mt-10 flex flex-col items-center gap-3">
                    <p className="text-xs text-[#6B6B70]">
                      {toBn(results.length)}টির মধ্যে {toBn(Math.min(visible, results.length))}টি দেখানো হচ্ছে
                    </p>
                    <div className="h-1 w-48 rounded-full bg-[#E5E5EA] overflow-hidden">
                      <div className="h-full bg-[#22242A]" style={{ width: `${(Math.min(visible, results.length) / results.length) * 100}%` }} />
                    </div>
                    <button
                      onClick={showMore}
                      className="mt-1 inline-flex items-center gap-2 rounded-xl border border-[#22242A] px-6 py-3 text-sm font-bold hover:bg-[#22242A] hover:text-white transition-colors"
                    >
                      আরও বই দেখুন
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------

export const BookCard: React.FC<{ book: Book; onSelect: (b: Book) => void; rank?: number; reads?: number; eager?: boolean }> = ({ book, onSelect, rank, reads, eager }) => {
  return (
    <button type="button" onClick={() => onSelect(book)} className="group block w-full text-left focus:outline-none cursor-pointer">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-black/5 shadow-[0_2px_8px_rgba(34,36,42,0.08)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_16px_30px_-12px_rgba(34,36,42,0.4)] group-focus-visible:ring-2 group-focus-visible:ring-[#FF6B6B]">
        <BookCover title={book.name} author={book.author} imageUrl={book.imageUrl} seed={book.id} eager={eager} />
        {rank && (
          <span className="absolute top-2 left-2 min-w-7 h-7 px-1.5 rounded-lg bg-[#FF6B6B] text-white text-xs font-black flex items-center justify-center shadow-md">
            {toBn(rank)}
          </span>
        )}
        {book.status !== "Available" && (
          <span className="absolute top-2 right-2 rounded-full bg-black/70 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-white">
            ধারকৃত
          </span>
        )}
      </div>
      <h3 className="mt-2.5 text-[13px] sm:text-sm font-bold leading-snug text-[#22242A] line-clamp-2 group-hover:text-[#E04848] transition-colors">
        {book.name}
      </h3>
      <p className="mt-0.5 text-xs text-[#6B6B70] line-clamp-1">{book.author}</p>
      {reads ? (
        <p className="mt-1 text-[11px] font-bold text-[#E04848]">{toBn(reads)} বার পড়া হয়েছে</p>
      ) : Number(book.price) > 0 ? (
        <p className="mt-1 text-xs font-semibold text-[#22242A]/80">{formatPrice(book.price!)}</p>
      ) : null}
    </button>
  );
};

function SectionHeader({ icon: Icon, title, subtitle, action }: { icon: React.ElementType; title: string; subtitle?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="mb-5 md:mb-6 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-lg md:text-2xl font-black text-[#22242A]">
          <span className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-[#FF6B6B]/10 text-[#E04848] flex items-center justify-center shrink-0">
            <Icon size={18} />
          </span>
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-xs md:text-sm text-[#6B6B70] pl-10 md:pl-11">{subtitle}</p>}
      </div>
      {action && (
        <button onClick={action.onClick} className="shrink-0 inline-flex items-center gap-1 text-xs md:text-sm font-bold text-[#22242A] hover:text-[#E04848] transition-colors">
          {action.label} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

function Shelf({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  return (
    <div className="relative group/shelf">
      <div ref={ref} className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-px-4 md:scroll-px-0 -mx-4 px-4 md:mx-0 md:px-0 pb-3">
        {children}
      </div>
      {[-1, 1].map((dir) => (
        <button
          key={dir}
          onClick={() => scroll(dir)}
          aria-label={dir < 0 ? "আগের বই" : "পরের বই"}
          className={`hidden md:flex absolute top-[38%] -translate-y-1/2 ${dir < 0 ? "-left-4" : "-right-4"} w-10 h-10 rounded-full bg-white shadow-lg ring-1 ring-black/5 items-center justify-center text-[#22242A] opacity-0 group-hover/shelf:opacity-100 transition-opacity hover:bg-[#22242A] hover:text-white`}
        >
          {dir < 0 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      ))}
    </div>
  );
}

const ShelfItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="snap-start shrink-0 w-[128px] sm:w-[148px] md:w-[164px]">{children}</div>
);

const CornerTile: React.FC<{ name: string; books: Book[]; onClick: () => void }> = ({ name, books, onClick }) => {
  const [from, to] = coverTone(name);
  const fan = books.slice(0, 3);
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl p-4 md:p-5 text-left text-white min-h-[150px] md:min-h-[170px] flex flex-col justify-between transition-transform hover:-translate-y-0.5"
      style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
    >
      <div className="relative z-10 max-w-[70%]">
        <p className="text-sm md:text-base font-black leading-snug line-clamp-2">{name}</p>
        <p className="mt-1 text-xs text-white/70">{toBn(books.length)}টি বই</p>
      </div>
      <span className="relative z-10 inline-flex items-center gap-1 text-[11px] font-bold text-white/85 group-hover:text-white">
        দেখুন <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </span>
      <div className="absolute -right-2 bottom-3 flex items-end" aria-hidden>
        {fan.map((b, i) => (
          <div
            key={b.id}
            className="w-10 md:w-12 aspect-[2/3] rounded-md overflow-hidden ring-2 ring-white/20 shadow-lg -ml-5 first:ml-0 transition-transform group-hover:-translate-y-1"
            style={{ transform: `rotate(${(i - 1) * 8}deg)`, zIndex: i }}
          >
            <BookCover title={b.name} author={b.author} imageUrl={b.imageUrl} seed={b.id} />
          </div>
        ))}
      </div>
    </button>
  );
};

const AuthorTile: React.FC<{ name: string; count: number; onClick: () => void }> = ({ name, count, onClick }) => {
  const [from, to] = coverTone(name);
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl bg-white border border-[#E5E5EA] p-3 text-left transition-all hover:border-[#22242A]/40 hover:shadow-md"
    >
      <span
        className="w-11 h-11 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
        style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
        aria-hidden
      >
        {firstGrapheme(name)}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-[#22242A] truncate">{name}</span>
        <span className="block text-xs text-[#6B6B70]">{toBn(count)}টি বই</span>
      </span>
    </button>
  );
};

const FilterChip: React.FC<{ active?: boolean; onClick: () => void; removable?: boolean; children: React.ReactNode }> = ({ active, onClick, removable, children }) => {
  return (
    <button
      onClick={onClick}
      data-active={active && !removable ? "true" : undefined}
      className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold border transition-colors ${
        active ? "bg-[#22242A] text-white border-[#22242A]" : "bg-white text-[#6B6B70] border-[#E5E5EA] hover:border-[#22242A]/40 hover:text-[#22242A]"
      }`}
    >
      {children}
      {removable && <X size={13} className="opacity-70" />}
    </button>
  );
};

function EmptyState({ title, hint, action }: { title: string; hint: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="rounded-3xl bg-white border border-[#E5E5EA] px-6 py-14 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-[#F5F3EF] flex items-center justify-center">
        <Search size={22} className="text-[#6B6B70]" />
      </div>
      <p className="mt-4 text-base font-bold">{title}</p>
      <p className="mt-1 text-sm text-[#6B6B70]">{hint}</p>
      {action && (
        <button onClick={action.onClick} className="mt-5 rounded-xl bg-[#22242A] px-5 py-2.5 text-sm font-bold text-white">
          {action.label}
        </button>
      )}
    </div>
  );
}

function LoadingShelves() {
  return (
    <div className="space-y-12" aria-busy="true" aria-label="বইয়ের তালিকা লোড হচ্ছে">
      {[0, 1].map((s) => (
        <div key={s}>
          <div className="h-7 w-48 rounded-lg bg-[#E9E7E2] animate-pulse" />
          <div className="mt-5 flex gap-4 overflow-hidden">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="shrink-0 w-[128px] sm:w-[148px] md:w-[164px]">
                <div className="aspect-[2/3] rounded-xl bg-[#E9E7E2] animate-pulse" />
                <div className="mt-3 h-3.5 w-4/5 rounded bg-[#E9E7E2] animate-pulse" />
                <div className="mt-2 h-3 w-1/2 rounded bg-[#E9E7E2] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
