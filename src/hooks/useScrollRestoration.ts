import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollRestoration(activeTab: string | null = null) {
  const location = useLocation();

  useEffect(() => {
    const key = `scrollPos:${location.pathname}${location.search}${activeTab ? `:${activeTab}` : ''}`;
    
    const restore = () => {
      const container = document.getElementById("main-scroll-container");
      const savedPos = localStorage.getItem(key);
      if (savedPos) {
        const pos = parseInt(savedPos, 10);
        if (container) container.scrollTo(0, pos);
        window.scrollTo(0, pos);
      } else {
        if (container) container.scrollTo(0, 0);
        window.scrollTo(0, 0);
      }
    };

    // Small delay ensures DOM is fully populated if data fetching was instantaneous
    const timeoutId = setTimeout(restore, 100);

    const handleScroll = (target: any) => {
      // Check if it's our designated scroll container or the document/window itself
      if (target && target.id === "main-scroll-container") {
        localStorage.setItem(key, target.scrollTop.toString());
      } else if (target === document || target === window) {
        localStorage.setItem(key, window.scrollY.toString());
      }
    };

    let debounceId: any;
    const debouncedScroll = (e: Event) => {
      if (debounceId) clearTimeout(debounceId);
      const target = e.target;
      debounceId = setTimeout(() => handleScroll(target), 100);
    };

    // Use capture phase to catch all scroll events (scroll events don't bubble)
    window.addEventListener("scroll", debouncedScroll, { passive: true, capture: true });
    
    return () => {
      clearTimeout(timeoutId);
      if (debounceId) clearTimeout(debounceId);
      // Type casting to handle exact match of AddEventListenerOptions
      window.removeEventListener("scroll", debouncedScroll, { capture: true } as any);
    };
  }, [location.pathname, location.search, activeTab]);
}
