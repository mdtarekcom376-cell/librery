import React, { useState, useEffect } from "react";
import { ArrowLeft, Rss, Calendar, LayoutGrid } from "lucide-react";
import { apiClient } from "../api";
import { BlogPost } from "../types";

interface PublicBlogPageProps {
  onBack: () => void;
  logoBase64?: string;
  onPostSelect?: (post: BlogPost) => void;
}

export default function PublicBlogPage({ onBack, logoBase64, onPostSelect }: PublicBlogPageProps) {
  const logoSrc = logoBase64 || "";
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get("/public/blog_posts");
        if (res && Array.isArray(res)) {
          setPosts(res);
        }
      } catch (err) {
        console.error("Failed to load posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPosts = posts.filter(p => {
    if (selectedCategory === "all") return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#F5F3EF] backdrop-blur-md border-b border-[#E5E5EA] shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all border border-[#E5E5EA] text-[#6B6B70] hover:bg-white"
              title="হোম পেজে ফিরে যান"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">হোম পেজ</span>
            </button>

            <div className="flex items-center gap-2.5">
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt="লোগো"
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-contain bg-white border border-[#E5E5EA] p-0.5"
                />
              )}
              <div>
                <h1 className="text-sm md:text-base font-bold flex items-center gap-2 text-[#22242A]">
                  <Rss size={16} />
                  সংবাদ ও ইভেন্ট
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-[#22242A]">
            <LayoutGrid size={18} />
            সকল পোস্টসমূহ
          </h2>

          <div className="flex bg-[#E5E5EA]/30 p-1 rounded-xl">
            {[
              { id: "all", label: "সব" },
              { id: "blog", label: "ব্লগ" },
              { id: "news", label: "সংবাদ" },
              { id: "event", label: "ইভেন্ট" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === tab.id
                    ? "bg-white text-[#22242A] shadow-sm border border-[#E5E5EA]"
                    : "text-[#6B6B70] hover:bg-[#E5E5EA]/50 border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin text-[#6B6B70] mx-auto w-8 h-8 border-4 border-[#E5E5EA] border-t-[#6B6B70] rounded-full"></div>
            <p className="text-sm font-medium text-[#6B6B70] mt-4">পোস্ট লোড করা হচ্ছে...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.4] backdrop-blur border border-[#E5E5EA] rounded-3xl">
            <Rss size={48} className="text-[#6B6B70]/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#22242A] mb-2">কোনো পোস্ট পাওয়া যায়নি</h3>
            <p className="text-sm text-[#6B6B70] max-w-sm mx-auto">
              এই ক্যাটাগরিতে বর্তমানে কোনো পোস্ট নেই।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredPosts.map(post => (
              <div
                key={post.id}
                onClick={() => onPostSelect?.(post)}
                className="group flex flex-col bg-white border border-[#E5E5EA] rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-48 sm:h-52 overflow-hidden bg-[#F5F3EF] flex items-center justify-center">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Rss size={32} className="text-[#6B6B70]/20" />
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-bold uppercase rounded-md shadow-sm border border-[#E5E5EA]">
                      {post.category === "blog" ? "ব্লগ" : post.category === "news" ? "সংবাদ" : "ইভেন্ট"}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#6B6B70] mb-2 font-medium">
                    <Calendar size={12} />
                    {new Date(post.createdAt).toLocaleDateString("bn-BD")}
                  </div>

                  <h3 className="font-bold text-[#22242A] text-sm sm:text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#6B6B70] line-clamp-3 mb-4 flex-1">
                    {post.content}
                  </p>

                  <div className="pt-4 mt-auto border-t border-[#E5E5EA] flex justify-between items-center text-xs text-[#6B6B70]">
                    <span className="font-medium group-hover:text-blue-600 transition-colors">বিস্তারিত পড়ুন &rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
