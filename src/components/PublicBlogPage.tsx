import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Rss,
  Calendar,
  LayoutGrid,
  Search,
  Clock,
  User,
  Sparkles,
  ArrowRight,
  BookOpen,
  Share2,
  Tag,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiClient } from "../api";
import { BlogPost } from "../types";
import { DEFAULT_BLOG_POSTS } from "../data/blogData";
import { updatePageSEO } from "../utils/seo";

interface PublicBlogPageProps {
  onBack: () => void;
  logoBase64?: string;
  onPostSelect?: (post: BlogPost) => void;
}

export default function PublicBlogPage({
  onBack,
  logoBase64,
  onPostSelect,
}: PublicBlogPageProps) {
  const logoSrc = logoBase64 || "";

  const [posts, setPosts] = useState<BlogPost[]>(DEFAULT_BLOG_POSTS);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Update SEO for Blog Index Page
  useEffect(() => {
    updatePageSEO({
      title: "ব্লগ, সংবাদ ও ইভেন্ট | অক্ষর পাঠাগার — বইয়ের আলোয় আলোকিত হোক জীবন",
      description:
        "অক্ষর পাঠাগারের অফিশিয়াল ব্লগ। বই পড়ার অভ্যাস, কালজয়ী বাংলা সাহিত্য, শিশু শিক্ষা, দুষ্প্রাপ্য পান্ডুলিপি ও কমিউনিটি লাইব্রেরি কার্যক্রম সম্পর্কিত ৭টি তথ্যবহুল নিবন্ধ ও সংবাদসমূহ পড়ুন।",
      keywords:
        "অক্ষর পাঠাগার ব্লগ, বই পড়ার গুরুত্ব, পাঠাভ্যাস, বাংলা সাহিত্য, বরগুনা পাঠাগার, কমিউনিটি লাইব্রেরি, akkhor pathagar blog",
      canonicalUrl: "https://www.okkhorpathagar.org/blog",
      ogType: "website",
      ogImage:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
      schemaData: {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "অক্ষর পাঠাগার ব্লগ",
        description:
          "বইয়ের আলোয় আলোকিত হোক জীবন — অক্ষর পাঠাগারের গবেষণা, সংবাদ ও পাঠচর্চা বিষয়ক ব্লগ।",
        url: "https://www.okkhorpathagar.org/blog",
        publisher: {
          "@type": "Organization",
          name: "অক্ষর পাঠাগার",
          logo: {
            "@type": "ImageObject",
            url: "https://www.okkhorpathagar.org/src/assets/images/akkhor_logo_1781456142605.jpg",
          },
        },
        blogPost: DEFAULT_BLOG_POSTS.map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          description: post.metaDescription || post.content.slice(0, 140),
          image: post.image,
          datePublished: post.createdAt,
          author: {
            "@type": "Person",
            name: post.author || "অক্ষর পাঠাগার",
          },
          url: `https://www.okkhorpathagar.org/blog/${post.slug || post.id}`,
        })),
      },
    });
  }, []);

  // Fetch from API with fallback to DEFAULT_BLOG_POSTS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/public/blog_posts");
        if (res && Array.isArray(res) && res.length > 0) {
          // Merge unique posts by id or title
          const existingIds = new Set(res.map((p: any) => String(p.id)));
          const extraDefaults = DEFAULT_BLOG_POSTS.filter(
            (d) => !existingIds.has(d.id)
          );
          setPosts([...res, ...extraDefaults]);
        } else {
          setPosts(DEFAULT_BLOG_POSTS);
        }
      } catch (err) {
        // Fallback gracefully to default curated posts
        setPosts(DEFAULT_BLOG_POSTS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered posts based on category and search query
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const titleMatch = p.title.toLowerCase().includes(query);
      const contentMatch = p.content.toLowerCase().includes(query);
      const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(query));
      const authorMatch = p.author?.toLowerCase().includes(query);

      return matchesCategory && (titleMatch || contentMatch || tagMatch || authorMatch);
    });
  }, [posts, selectedCategory, searchQuery]);

  // Categories with counts
  const categoryCounts = useMemo(() => {
    return {
      all: posts.length,
      blog: posts.filter((p) => p.category === "blog").length,
      news: posts.filter((p) => p.category === "news").length,
      event: posts.filter((p) => p.category === "event").length,
    };
  }, [posts]);

  // Featured post (first post) and remaining posts
  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const remainingPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-all border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
              title="হোম পেজে ফিরে যান"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline font-display-bn">হোম পেজ</span>
            </button>

            <div className="flex items-center gap-2.5">
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt="অক্ষর পাঠাগার লোগো"
                  className="w-9 h-9 rounded-xl object-contain bg-white border border-slate-200 p-0.5 shadow-2xs"
                />
              )}
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 font-display-bn flex items-center gap-2">
                  <Rss size={16} className="text-[#2563EB]" />
                  অক্ষর পাঠাগার ব্লগ ও সংবাদ
                </h1>
                <p className="text-[11px] text-slate-500 font-display-bn hidden sm:block">
                  জ্ঞানচর্চা, শিক্ষা ও মানবিক আন্দোলনের বাতিঘর
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-display-bn">
              মোট {posts.length}টি প্রকাশনা
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-transparent pt-8 pb-6 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold font-display-bn mb-3">
            <Sparkles size={13} className="text-blue-600" />
            <span>অক্ষরে অক্ষরে জ্ঞানের পথে</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-display-bn mb-3 tracking-tight">
            জ্ঞান ও সাহিত্য ভাবনা বিষয়ক ব্লগ
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-body-bn mb-6">
            বই পড়ার আনন্দ, কালজয়ী সাহিত্য চর্চা, শিক্ষা বিস্তারের গল্প এবং অক্ষর পাঠাগারের সর্বশেষ আয়োজন নিয়ে সাজানো আমাদের ব্লগ।
          </p>

          {/* Search & Filter Controls */}
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ব্লগ শিরোনাম, বিষয়বস্তু বা কীওয়ার্ড দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-2xs font-body-bn text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {[
              { id: "all", label: "সব নিবন্ধ", count: categoryCounts.all },
              { id: "blog", label: "ব্লগ ও প্রবন্ধ", count: categoryCounts.blog },
              { id: "news", label: "সংবাদ ও উদ্যোগ", count: categoryCounts.news },
              { id: "event", label: "আসন্ন ইভেন্ট", count: categoryCounts.event },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer font-display-bn flex items-center gap-1.5 ${
                  selectedCategory === tab.id
                    ? "bg-[#2563EB] text-white shadow-sm shadow-blue-500/20 scale-102"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin text-blue-600 mx-auto w-9 h-9 border-4 border-slate-200 border-t-blue-600 rounded-full" />
            <p className="text-sm font-medium text-slate-500 mt-4 font-display-bn">
              ব্লগ পোস্ট লোড করা হচ্ছে...
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8 max-w-lg mx-auto shadow-2xs">
            <Rss size={44} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 font-display-bn mb-2">
              কোনো পোস্ট খুঁজে পাওয়া যায়নি
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-body-bn mb-5">
              "{searchQuery}" অনুসন্ধান অনুযায়ী কোনো নিবন্ধ মেলেনি। বানান চেক করুন অথবা ফিল্টার পরিবর্তন করুন।
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl font-display-bn transition-colors cursor-pointer"
            >
              সব পোস্ট দেখুন
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 1. Featured Post Hero Card (shown when no deep search filtering or on first page) */}
            {featuredPost && (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => onPostSelect?.(featuredPost)}
                className="group relative bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
              >
                {/* Image Box */}
                <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[280px] overflow-hidden bg-slate-100">
                  {featuredPost.image ? (
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      loading="eager"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <BookOpen size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
                  
                  {/* Category Pill Badge */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/95 text-blue-700 shadow-sm border border-slate-200 font-display-bn flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      {featuredPost.category === "blog"
                        ? "বিশেষ ব্লগ"
                        : featuredPost.category === "news"
                        ? "বিশেষ সংবাদ"
                        : "আসন্ন ইভেন্ট"}
                    </span>
                  </div>
                </div>

                {/* Content Box */}
                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3 font-display-bn">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-blue-600" />
                        {new Date(featuredPost.createdAt).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      {featuredPost.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-slate-400" />
                          {featuredPost.readTime}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display-bn mb-3 leading-snug group-hover:text-blue-600 transition-colors">
                      {featuredPost.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 font-body-bn line-clamp-4 leading-relaxed mb-4">
                      {featuredPost.metaDescription || featuredPost.content}
                    </p>

                    {/* Tags */}
                    {featuredPost.tags && featuredPost.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {featuredPost.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-medium font-body-bn"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    {featuredPost.author && (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                          {featuredPost.author.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 font-display-bn">
                          {featuredPost.author}
                        </span>
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform font-display-bn">
                      সম্পূর্ণ পড়ুন <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </motion.article>
            )}

            {/* 2. Grid of Remaining Posts */}
            {remainingPosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display-bn flex items-center gap-2">
                    <LayoutGrid size={18} className="text-blue-600" />
                    আরও গুরুত্বপূর্ণ নিবন্ধসমূহ
                  </h3>
                  <span className="text-xs text-slate-500 font-display-bn">
                    দেখাচ্ছে {remainingPosts.length}টি নিবন্ধ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remainingPosts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: index * 0.05 }}
                      onClick={() => onPostSelect?.(post)}
                      className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      {/* Post Thumbnail */}
                      <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 flex items-center justify-center">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80";
                            }}
                          />
                        ) : (
                          <Rss size={32} className="text-slate-300" />
                        )}

                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-xs text-[11px] font-bold rounded-lg shadow-xs border border-slate-200 font-display-bn text-slate-800">
                            {post.category === "blog"
                              ? "ব্লগ"
                              : post.category === "news"
                              ? "সংবাদ"
                              : "ইভেন্ট"}
                          </span>
                        </div>

                        {post.readTime && (
                          <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-[10px] text-white rounded-md flex items-center gap-1 font-display-bn">
                            <Clock size={10} />
                            {post.readTime}
                          </div>
                        )}
                      </div>

                      {/* Post Info */}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 font-display-bn">
                          <Calendar size={12} className="text-slate-400" />
                          <span>
                            {new Date(post.createdAt).toLocaleDateString("bn-BD", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          {post.eventDate && (
                            <span className="ml-auto text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                              {post.eventDate}
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-slate-900 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 font-display-bn">
                          {post.title}
                        </h4>

                        <p className="text-xs text-slate-600 font-body-bn line-clamp-3 mb-4 leading-relaxed flex-1">
                          {post.metaDescription || post.content}
                        </p>

                        <div className="pt-3.5 mt-auto border-t border-slate-100 flex items-center justify-between text-xs font-display-bn">
                          <span className="text-slate-500 truncate max-w-[150px]">
                            {post.author || "অক্ষর পাঠাগার"}
                          </span>
                          <span className="font-bold text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            বিস্তারিত পড়ুন <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
