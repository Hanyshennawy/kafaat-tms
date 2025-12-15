import { useState, useEffect, useCallback } from 'react';

const RECENT_PAGES_KEY = 'kafaat-recent-pages';
const MAX_RECENT_PAGES = 5;

export interface RecentPage {
  path: string;
  label: string;
  timestamp: number;
}

export function useRecentPages() {
  const [recentPages, setRecentPages] = useState<RecentPage[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_PAGES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(recentPages));
  }, [recentPages]);

  const addRecentPage = useCallback((path: string, label: string) => {
    setRecentPages(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.path !== path);
      // Add to front
      const updated = [{ path, label, timestamp: Date.now() }, ...filtered];
      // Keep only MAX_RECENT_PAGES
      return updated.slice(0, MAX_RECENT_PAGES);
    });
  }, []);

  const clearRecentPages = useCallback(() => {
    setRecentPages([]);
  }, []);

  return { recentPages, addRecentPage, clearRecentPages };
}
