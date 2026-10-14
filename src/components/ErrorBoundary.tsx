import React from "react";

interface Props {
  children: React.ReactNode;
  /** Full-page fallback (public routes) vs. an inline card (inside the dashboard). */
  fullPage?: boolean;
}

interface State {
  error: Error | null;
}

// After a deploy, a tab opened earlier may ask for code-split chunks that no longer exist.
const isStaleChunkError = (e: Error) => /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(e.message);

/** Keeps one broken view from blanking the whole site; offers a retry instead. */
export default class ErrorBoundary extends React.Component<Props, State> {
  // The project has no @types/react, so spell out the members this class uses.
  declare props: Readonly<Props>;
  declare setState: (state: State) => void;
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("UI error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const stale = isStaleChunkError(error);
    const retry = () => (stale ? window.location.reload() : this.setState({ error: null }));

    return (
      <div className={`flex items-center justify-center px-4 ${this.props.fullPage ? "min-h-screen bg-[#F7F6F3]" : "py-16"}`} role="alert">
        <div className="max-w-md w-full rounded-2xl border border-[#E5E5EA] bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-bold text-[#22242A]">{stale ? "সাইটটি আপডেট হয়েছে" : "কিছু একটা ঠিকমতো লোড হয়নি"}</p>
          <p className="mt-2 text-sm text-[#6B6B70]">
            {stale ? "নতুন সংস্করণ দেখতে পাতাটি আবার লোড করুন।" : "আবার চেষ্টা করুন। সমস্যা থাকলে পাতাটি রিফ্রেশ করুন।"}
          </p>
          <button onClick={retry} className="mt-5 rounded-xl bg-[#22242A] px-5 py-2.5 text-sm font-bold text-white">
            {stale ? "রিলোড করুন" : "আবার চেষ্টা করুন"}
          </button>
        </div>
      </div>
    );
  }
}
