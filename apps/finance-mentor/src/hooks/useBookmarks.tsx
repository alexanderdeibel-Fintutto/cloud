import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "fintutto_bookmarks";

/**
 * Hook for managing course bookmarks (favorites).
 * Persists to localStorage per user.
 */
export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const storageKey = user ? `${STORAGE_KEY}_${user.id}` : STORAGE_KEY;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setBookmarks(JSON.parse(stored));
    } catch {
      setBookmarks([]);
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: string[]) => {
      setBookmarks(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey]
  );

  const toggleBookmark = useCallback(
    (courseId: string) => {
      persist(
        bookmarks.includes(courseId)
          ? bookmarks.filter((id) => id !== courseId)
          : [...bookmarks, courseId]
      );
    },
    [bookmarks, persist]
  );

  const isBookmarked = useCallback(
    (courseId: string) => bookmarks.includes(courseId),
    [bookmarks]
  );

  return { bookmarks, toggleBookmark, isBookmarked };
}
