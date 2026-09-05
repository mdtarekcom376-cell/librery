import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Check,
  Facebook,
  MessageCircle,
  Twitter,
  BookOpen,
  Tag,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import { BlogPost } from "../types";
import { DEFAULT_BLOG_POSTS, getBlogPostByIdOrSlug, getRelatedBlogPosts } from "../data/blogData";
import { updatePageSEO } from "../utils/seo";

interface PublicBlogDetailsPageProps {
  post?: BlogPost | null;
  onBack: () => void;
  logoBase64?: string;
  onPostSelect?: (post: BlogPost) => void;
}

export default function PublicBlogDetailsPage({
  post: propPost,
  onBack,
  logoBase64,
  onPostSelect,
}: PublicBlogDetailsPageProps) {
  const navigate = useNavigate();
  const { idOrSlug } = useParams<{ idOrSlug?: string }>();

  // Determine active post from prop or from URL params
  const [activePost, setActivePost] = useState<BlogPost | null>(() => {
    if (propPost) return propPost;
    if (idOrSlug) {
      const found = getBlogPostByIdOrSlug(idOrSlug);
      if (found) return found;
    }
    return DEFAULT_BLOG_POSTS[0];
  });

  const [copied, setCopied] = useState(false);

  // Sync if propPost changes or if idOrSlug in route changes
  useEffect(() => {
    if (propPost) {
      setActivePost(propPost);
    } else if (idOrSlug) {
      const found = getBlogPostByIdOrSlug(idOrSlug);
      if (found) {
        setActivePost(found);
      }
    }
  }, [propPost, idOrSlug]);

  // Update Dynamic SEO when active post changes
  useEffect(() => {
    if (!activePost) return;

    const currentUrl = `https://www.okkhorpathagar.org/blog/${activePost.slug || activePost.id}`;
    const postDesc =
      activePost.metaDescription ||
      activePost.content.replace(/[#*]/g, "").slice(0, 155) + "...";
    const postKeywords = [
      ...(activePost.tags || []),
      "অক্ষর পাঠাগার",
      "বই পড়া",
      "বাংলা সাহিত্য",
      "বরগুনা",
      "কমিউনিটি লাইব্রেরি",
    ].join(", ");

    updatePageSEO({
      title: `${activePost.title} | অক্ষর পাঠাগার ব্লগ`,
      description: postDesc,
      keywords: postKeywords,
      canonicalUrl: currentUrl,
      ogImage: activePost.image,
      ogType: "article",
      publishedTime: activePost.createdAt,
      modifiedTime: activePost.createdAt,
      author: activePost.author || "অক্ষর পাঠাগার",
      section:
        activePost.category === "blog"
          ? "ব্লগ"
          : activePost.category === "news"
          ? "সংবাদ"
          : "ইভেন্ট",
      schemaData: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": currentUrl,
        },
        headline: activePost.title,
        description: postDesc,
        image: [activePost.image],
        datePublished: activePost.createdAt,
        dateModified: activePost.createdAt,
        author: {
          "@type": "Person",
          name: activePost.author || "অক্ষর পাঠাগার",
        },
        publisher: {
          "@type": "Organization",
          name: "অক্ষর পাঠাগার",
          logo: {
            "@type": "ImageObject",
            url: "https://www.okkhorpathagar.org/src/assets/images/akkhor_logo_1781456142605.jpg",
          },
        },
      },
    });

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activePost]);

  if (!activePost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md">
          <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800 font-display-bn mb-2">
            পোস্টটি খুঁজে পাওয়া যায়নি
          </h2>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold font-display-bn"
          >
            ব্লগ তালিকায় ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  const logoSrc = logoBase64 || "";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${activePost.title} — অক্ষর পাঠাগার ব্লগে পড়ুন:`;

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const relatedPosts = getRelatedBlogPosts(activePost.id, 3);

  // Render markdown-like content cleanly
  const renderFormattedContent = (rawText: string) => {
    const lines = rawText.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-4" />;
      }
      // Subheading ###
      if (trimmed.startsWith("### ")) {
        return (
          <h3
            key={idx}
            className="text-lg sm:text-xl font-extrabold text-slate-900 font-display-bn mt-6 mb-3 flex items-center gap-2"
          >
            <span className="w-1.5 h-5 bg-blue-600 rounded-full inline-block" />
            {trimmed.replace("### ", "")}
          </h3>
        );
      }
      // Bullet list item
      if (trimmed.startsWith("- ")) {
        return (
          <li
            key={idx}
            className="text-sm sm:text-base text-slate-700 font-body-bn ml-4 mb-2 list-disc leading-relaxed"
          >
            {trimmed.replace("- ", "")}
          </li>
        );
      }
      // Numbered list item (e.g. 1. or ১.)
      if (/^([0-9১-৯]+)\.\s/.test(trimmed)) {
        return (
          <div
            key={idx}
            className="text-sm sm:text-base text-slate-700 font-body-bn mb-2.5 leading-relaxed bg-blue-50/40 p-3 rounded-xl border border-blue-100/60"
          >
            {trimmed}
          </div>
        );
      }
      // Standard Paragraph
      return (
        <p
          key={idx}
          className="text-sm sm:text-base text-slate-700 font-body-bn leading-relaxed mb-4"
        >
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-all border border-slate-200 text-slate-700 hover:bg-slate-100"
              title="সকল ব্লগে ফিরে যান"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline font-display-bn">সকল ব্লগ</span>
            </button>

            {logoSrc && (
              <img
                src={logoSrc}
                alt="অক্ষর পাঠাগার লোগো"
                className="w-8 h-8 rounded-lg object-contain bg-white border border-slate-200 p-0.5"
              />
            )}
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 font-display-bn line-clamp-1 max-w-[200px] sm:max-w-md">
                {activePost.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold font-display-bn flex items-center gap-1.5 cursor-pointer"
              title="লিংক কপি করুন"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copied ? "কপি হয়েছে!" : "শেয়ার"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Article Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Breadcrumb Navigation for SEO */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-slate-500 font-display-bn flex-wrap">
            <li>
              <button
                onClick={() => navigate("/")}
                className="hover:text-blue-600 cursor-pointer"
              >
                হোম
              </button>
            </li>
            <li><ChevronRight size={12} className="text-slate-400" /></li>
            <li>
              <button
                onClick={onBack}
                className="hover:text-blue-600 cursor-pointer"
              >
                ব্লগ ও সংবাদ
              </button>
            </li>
            <li><ChevronRight size={12} className="text-slate-400" /></li>
            <li className="text-blue-600 font-semibold truncate max-w-[220px]">
              {activePost.category === "blog" ? "ব্লগ" : activePost.category === "news" ? "সংবাদ" : "ইভেন্ট"}
            </li>
          </ol>
        </nav>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs"
        >
          {/* Cover Hero Image */}
          {activePost.image && (
            <div className="w-full relative h-64 sm:h-96 md:h-[420px] overflow-hidden bg-slate-100">
              <img
                src={activePost.image}
                alt={activePost.title}
                loading="eager"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Badges on image */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-white">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold font-display-bn shadow-xs">
                  {activePost.category === "blog"
                    ? "জ্ঞান ও সাহিত্য ব্লগ"
                    : activePost.category === "news"
                    ? "পাঠাগার সংবাদ"
                    : "বিশেষ ইভেন্ট"}
                </span>
                {activePost.readTime && (
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-xs rounded-full text-xs font-medium font-display-bn flex items-center gap-1.5">
                    <Clock size={12} />
                    {activePost.readTime}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Article Header & Body */}
          <div className="p-6 sm:p-10 md:p-12">
            {/* Meta bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100 text-xs text-slate-500 font-display-bn">
              <div className="flex flex-wrap items-center gap-4">
                {activePost.author && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {activePost.author.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-800">
                      {activePost.author}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-blue-600" />
                  <time dateTime={activePost.createdAt}>
                    {new Date(activePost.createdAt).toLocaleDateString("bn-BD", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>

                {activePost.eventDate && (
                  <div className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md font-bold text-xs border border-amber-200/60">
                    ইভেন্ট তারিখ: {activePost.eventDate}
                  </div>
                )}
              </div>

              {/* Social Share Buttons */}
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#1877F2] hover:text-white flex items-center justify-center text-slate-600 transition-colors"
                  title="ফেসবুকে শেয়ার করুন"
                >
                  <Facebook size={14} />
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    shareText + " " + shareUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#25D366] hover:text-white flex items-center justify-center text-slate-600 transition-colors"
                  title="হোয়াটসঅ্যাপে শেয়ার করুন"
                >
                  <MessageCircle size={14} />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    shareText
                  )}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-black hover:text-white flex items-center justify-center text-slate-600 transition-colors"
                  title="টুইটারে শেয়ার করুন"
                >
                  <Twitter size={14} />
                </a>
                <button
                  onClick={handleCopyLink}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  title="লিংক কপি করুন"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                </button>
              </div>
            </div>

            {/* Article Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-display-bn mb-6 leading-tight">
              {activePost.title}
            </h1>

            {/* Content Body */}
            <div className="prose prose-slate max-w-none">
              {renderFormattedContent(activePost.content)}
            </div>

            {/* Tags Cloud */}
            {activePost.tags && activePost.tags.length > 0 && (
              <div className="pt-8 mt-8 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display-bn mb-3 flex items-center gap-1.5">
                  <Tag size={13} />
                  ট্যাগসমূহ
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activePost.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg text-xs font-medium font-body-bn transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.article>

        {/* Related Posts Recommendation */}
        {relatedPosts.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 font-display-bn flex items-center gap-2">
                <BookOpen size={20} className="text-blue-600" />
                সম্পর্কিত অন্যান্য পোস্ট
              </h3>
              <button
                onClick={onBack}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 font-display-bn flex items-center gap-1 cursor-pointer"
              >
                সবগুলো দেখুন <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((rPost) => (
                <article
                  key={rPost.id}
                  onClick={() => {
                    setActivePost(rPost);
                    navigate(`/blog/${rPost.slug || rPost.id}`);
                    onPostSelect?.(rPost);
                  }}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="h-36 overflow-hidden bg-slate-100 relative">
                    {rPost.image && (
                      <img
                        src={rPost.image}
                        alt={rPost.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 text-[10px] font-bold rounded-md text-slate-800 font-display-bn">
                      {rPost.category === "blog" ? "ব্লগ" : rPost.category === "news" ? "সংবাদ" : "ইভেন্ট"}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-bold text-slate-900 text-sm font-display-bn line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                      {rPost.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-display-bn mt-auto">
                      {new Date(rPost.createdAt).toLocaleDateString("bn-BD")}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Back Button Footer */}
        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold font-display-bn shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>ব্লগ তালিকায় ফিরে যান</span>
          </button>
        </div>
      </main>
    </div>
  );
}
