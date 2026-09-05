/**
 * Dynamic SEO and Meta Tag Manager for Akkhor Pathagar
 * Manages document title, meta tags (description, keywords, robots),
 * Open Graph (OG), Twitter Card, Canonical link, and JSON-LD structured data.
 */

export interface SEOOptions {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  schemaData?: Record<string, any>;
}

const DEFAULT_KEYWORDS =
  "অক্ষর পাঠাগার, অক্ষর পাঠাগার ব্লগ, উন্মুক্ত পাঠাগার, ডিজিটাল পাঠাগার, বরগুনা লাইব্রেরি, বাংলা বই, বই পড়ার অভ্যাস, বাংলা সাহিত্য, শিক্ষামূলক উদ্যোগ, akkhor pathagar blog, bangla library";

const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80";

function setMetaTag(attributeName: "name" | "property", attributeValue: string, content: string) {
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function setJsonLd(schemaId: string, data: Record<string, any>) {
  let script = document.getElementById(schemaId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = schemaId;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data, null, 2);
}

export function updatePageSEO(options: SEOOptions) {
  if (typeof document === "undefined") return;

  const {
    title,
    description,
    keywords = DEFAULT_KEYWORDS,
    canonicalUrl = window.location.href,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = "website",
    publishedTime,
    modifiedTime,
    author = "অক্ষর পাঠাগার",
    section,
    schemaData,
  } = options;

  // 1. Title Tag
  document.title = title;

  // 2. Standard Meta Tags
  setMetaTag("name", "description", description);
  setMetaTag("name", "keywords", keywords);
  setMetaTag("name", "author", author);
  setMetaTag("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

  // 3. Canonical URL
  setCanonical(canonicalUrl);

  // 4. Open Graph Meta Tags
  setMetaTag("property", "og:title", title);
  setMetaTag("property", "og:description", description);
  setMetaTag("property", "og:type", ogType);
  setMetaTag("property", "og:url", canonicalUrl);
  setMetaTag("property", "og:site_name", "অক্ষর পাঠাগার");
  setMetaTag("property", "og:locale", "bn_BD");
  setMetaTag("property", "og:image", ogImage);

  if (ogType === "article") {
    if (publishedTime) setMetaTag("property", "article:published_time", publishedTime);
    if (modifiedTime) setMetaTag("property", "article:modified_time", modifiedTime);
    if (author) setMetaTag("property", "article:author", author);
    if (section) setMetaTag("property", "article:section", section);
  }

  // 5. Twitter Card Meta Tags
  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", title);
  setMetaTag("name", "twitter:description", description);
  setMetaTag("name", "twitter:image", ogImage);

  // 6. JSON-LD Structured Data
  if (schemaData) {
    setJsonLd("dynamic-seo-schema", schemaData);
  }
}
