import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Building, Check, FileText, Hash, Layers, Library, Share2, User } from "lucide-react";
import { motion } from "motion/react";
import { Book } from "../types";
import { apiClient } from "../api";
import BookCover from "./BookCover";
import { BookCard } from "./PublicBooksPage";
import DeveloperCreditBadge from "./DeveloperCreditBadge";
import { PLACEHOLDER_AUTHORS, formatPrice, getCachedCatalog, loadCatalog, toBn } from "../lib/catalog";

interface PublicBookDetailsPageProps {
  /** The book the visitor clicked, if any — shown instantly while the URL's book is confirmed. */
  initialBook?: Book | null;
  onBack: () => void;
  onBookSelect?: (book: Book) => void;
  logoBase64?: string;
}

const SITE_TITLE = "অক্ষর পাঠাগার";

export default function PublicBookDetailsPage({ initialBook, onBack, onBookSelect, logoBase64 }: PublicBookDetailsPageProps) {
  const { id = "" } = useParams();
  const fromCache = () =>
    (initialBook && String(initialBook.id) === id ? initialBook : null) ||
    getCachedCatalog()?.books.find((b) => b.id === id) ||
    null;

  const [book, setBook] = useState<Book | null>(fromCache);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">(book ? "ready" : "loading");
  const [catalog, setCatalog] = useState<Book[]>(getCachedCatalog()?.books || []);
  const [copied, setCopied] = useState(false);

  // Load (or switch to) the book in the URL.
  useEffect(() => {
    const known = fromCache();
    setBook(known);
    setStatus(known ? "ready" : "loading");
    window.scrollTo(0, 0);
    let cancelled = false;
    apiClient
      .get(`/public/books/${encodeURIComponent(id)}`)
      .then((res) => {
        if (cancelled) return;
        if (res?.book) { setBook(res.book); setStatus("ready"); }
      })
      .catch((err: Error) => {
        if (cancelled || known) return;
        setStatus(/পাওয়া যায়নি/.test(err.message) ? "missing" : "error");
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // The rest of the catalogue powers "more by this author".
  useEffect(() => {
    if (catalog.length) return;
    loadCatalog().then((c) => setCatalog(c.books)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!book) return;
    const previous = document.title;
    document.title = `${book.name} — ${book.author} | ${SITE_TITLE}`;
    return () => { document.title = previous; };
  }, [book]);

  const related = useMemo(() => {
    if (!book) return { title: "", books: [] as Book[] };
    const others = catalog.filter((b) => b.id !== book.id);
    const sameAuthor = others.filter((b) => b.author && b.author.trim() === (book.author || "").trim());
    if (sameAuthor.length) return { title: `${book.author} — এর আরও বই`, books: sameAuthor.slice(0, 12) };
    const sameGroup = book.group ? others.filter((b) => b.group === book.group) : [];
    if (sameGroup.length) return { title: `${book.group} — থেকে আরও`, books: sameGroup.slice(0, 12) };
    return { title: "নতুন সংযোজন", books: others.slice(0, 12) };
  }, [book, catalog]);

  const share = async () => {
    if (!book) return;
    const url = `${window.location.origin}/books/${book.id}`;
    const data = { title: book.name, text: `${book.name} — ${book.author} | ${SITE_TITLE}`, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled the share sheet */
    }
  };

  const facts = book
    ? [
        { icon: Building, label: "প্রকাশনী", value: book.publisher },
        { icon: FileText, label: "পৃষ্ঠা সংখ্যা", value: Number(book.pageCount) > 0 ? `${toBn(book.pageCount!)} পৃষ্ঠা` : "" },
        { icon: Hash, label: "বইয়ের কোড", value: book.code ? toBn(book.code) : "" },
        { icon: Library, label: "মূল্য", value: Number(book.price) > 0 ? formatPrice(book.price!) : "" },
      ].filter((f) => f.value && !PLACEHOLDER_AUTHORS.has(String(f.value).trim().toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#22242A]">
      {/* Header — matches the catalogue */}
      <header className="sticky top-0 z-50 bg-[#22242A]/95 backdrop-blur-md border-b border-white/10 text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 md:px-8 h-14">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors border border-white/15 text-white/80 hover:bg-white/10 hover:text-white"
              aria-label="ফিরে যান"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">ফিরে যান</span>
            </button>
            <Link to="/books" className="flex items-center gap-2.5 min-w-0">
              {logoBase64 && <img src={logoBase64} alt="অক্ষর পাঠাগার লোগো" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm md:text-base font-bold leading-tight truncate">বইয়ের ভুবন</p>
                <p className="text-[10px] text-white/50 leading-tight">Akkhor Library Catalog</p>
              </div>
            </Link>
          </div>
          {book && (
            <button
              onClick={share}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-xs font-bold"
              aria-label="বইটি শেয়ার করুন"
            >
              {copied ? <Check size={14} /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copied ? "লিংক কপি হয়েছে" : "শেয়ার করুন"}</span>
            </button>
          )}
        </div>
      </header>

      {status === "loading" && !book ? (
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16 grid md:grid-cols-[minmax(0,320px)_1fr] gap-8 md:gap-12" aria-busy="true">
          <div className="mx-auto w-full max-w-[240px] md:max-w-none aspect-[2/3] rounded-2xl bg-[#E9E7E2] animate-pulse" />
          <div className="space-y-4">
            <div className="h-9 w-3/4 rounded-lg bg-[#E9E7E2] animate-pulse" />
            <div className="h-5 w-1/3 rounded bg-[#E9E7E2] animate-pulse" />
            <div className="h-24 w-full rounded-xl bg-[#E9E7E2] animate-pulse" />
          </div>
        </div>
      ) : !book ? (
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-white border border-[#E5E5EA] flex items-center justify-center">
            <BookOpen size={22} className="text-[#6B6B70]" />
          </div>
          <h1 className="mt-4 text-xl font-black">{status === "missing" ? "বইটি পাওয়া যায়নি" : "বইয়ের তথ্য লোড করা যায়নি"}</h1>
          <p className="mt-2 text-sm text-[#6B6B70]">
            {status === "missing" ? "লিংকটি সম্ভবত পুরনো বা ভুল।" : "ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।"}
          </p>
          <Link to="/books" className="mt-6 inline-flex rounded-xl bg-[#22242A] px-5 py-2.5 text-sm font-bold text-white">
            বইয়ের ভুবনে যান
          </Link>
        </div>
      ) : (
        <>
          <motion.main
            key={book.id}
            className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-14"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <nav className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-[#6B6B70] min-w-0" aria-label="ব্রেডক্রাম্ব">
              <Link to="/books" className="hover:text-[#22242A] shrink-0">বইয়ের ভুবন</Link>
              {book.group && (
                <>
                  <span>/</span>
                  <Link to={`/books?group=${encodeURIComponent(book.group)}`} className="hover:text-[#22242A] truncate">{book.group}</Link>
                </>
              )}
              <span>/</span>
              <span className="text-[#22242A] truncate">{book.name}</span>
            </nav>

            <div className="grid md:grid-cols-[minmax(0,320px)_1fr] gap-8 md:gap-12 items-start">
              {/* Cover */}
              <div className="mx-auto w-full max-w-[240px] md:max-w-none md:sticky md:top-24">
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden ring-1 ring-black/5 shadow-[0_24px_48px_-20px_rgba(34,36,42,0.45)]">
                  <BookCover title={book.name} author={book.author} imageUrl={book.imageUrl} seed={book.id} eager />
                </div>
              </div>

              {/* Details */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      book.status === "Available" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${book.status === "Available" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {book.status === "Available" ? "এখন পড়ার জন্য উপলব্ধ" : "বর্তমানে ধারকৃত"}
                  </span>
                  {book.group && (
                    <Link
                      to={`/books?group=${encodeURIComponent(book.group)}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#22242A] ring-1 ring-[#E5E5EA] hover:ring-[#22242A]/40"
                    >
                      <Layers size={12} /> {book.group}
                    </Link>
                  )}
                </div>

                <h1 className="mt-4 text-2xl sm:text-3xl md:text-[42px] font-black leading-tight break-words">{book.name}</h1>

                {book.author && (
                  <Link
                    to={`/books?author=${encodeURIComponent(book.author.trim())}`}
                    className="mt-3 inline-flex items-center gap-2 text-base md:text-lg font-bold text-[#E04848] hover:underline underline-offset-4"
                  >
                    <User size={18} className="shrink-0" />
                    {book.author}
                  </Link>
                )}

                {facts.length > 0 && (
                  <dl className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-3 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">
                    {facts.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="rounded-2xl bg-white ring-1 ring-[#E5E5EA] px-4 py-3 min-w-0">
                        <dt className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B6B70]">
                          <Icon size={13} /> {label}
                        </dt>
                        <dd className="mt-1 text-sm font-bold text-[#22242A] break-words">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <section className="mt-8">
                  <h2 className="text-sm font-black text-[#22242A]">বইয়ের বিবরণ</h2>
                  {book.description?.trim() ? (
                    <p className="mt-3 text-[15px] leading-relaxed text-[#3A3C42] whitespace-pre-wrap break-words">{book.description}</p>
                  ) : (
                    <p className="mt-3 text-sm text-[#6B6B70]">এই বইয়ের বিবরণ এখনো যুক্ত করা হয়নি।</p>
                  )}
                </section>

                <div className="mt-8 rounded-2xl bg-[#22242A] text-white p-5 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-bold">বইটি পড়তে চান?</p>
                    <p className="mt-1 text-sm text-white/65">পাঠাগারে এসে বা সদস্য হয়ে বইটি ধার নিতে পারবেন।</p>
                  </div>
                  <button
                    onClick={share}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 text-sm font-bold shrink-0"
                  >
                    {copied ? <Check size={16} /> : <Share2 size={16} />}
                    {copied ? "লিংক কপি হয়েছে" : "বন্ধুকে শেয়ার করুন"}
                  </button>
                </div>
              </div>
            </div>
          </motion.main>

          {related.books.length > 0 && (
            <section className="max-w-6xl mx-auto px-4 md:px-8 pb-14">
              <div className="mb-5 flex items-end justify-between gap-4">
                <h2 className="text-lg md:text-2xl font-black">{related.title}</h2>
                <Link to="/books" className="shrink-0 text-xs md:text-sm font-bold hover:text-[#E04848]">সব বই →</Link>
              </div>
              <div className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 pb-3">
                {related.books.map((b) => (
                  <div key={b.id} className="snap-start shrink-0 w-[128px] sm:w-[148px] md:w-[164px]">
                    <BookCard book={b} onSelect={(x) => onBookSelect?.(x)} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <footer className="border-t border-[#E5E5EA] py-6 px-4 text-center bg-white">
        <p className="text-xs text-[#6B6B70] font-bold">© {toBn(new Date().getFullYear())} অক্ষর পাঠাগার। সর্বস্বত্ব সংরক্ষিত।</p>
        <div className="mt-3 flex items-center justify-center">
          <DeveloperCreditBadge size="sm" />
        </div>
      </footer>
    </div>
  );
}
