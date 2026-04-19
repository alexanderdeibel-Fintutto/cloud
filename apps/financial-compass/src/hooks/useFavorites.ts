import { useState, useCallback, useEffect } from 'react';

export interface Favorite {
  id: string;
  path: string;
  title: string;
  icon?: string;
  addedAt: string;
}

const STORAGE_KEY = 'fintutto_favorites';
const MAX_FAVORITES = 10;

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Add favorite
  const addFavorite = useCallback((path: string, title: string, icon?: string) => {
    // Check if already exists
    if (favorites.some(f => f.path === path)) {
      return false;
    }

    const newFavorite: Favorite = {
      id: `fav_${Date.now()}`,
      path,
      title,
      icon,
      addedAt: new Date().toISOString(),
    };

    setFavorites(prev => {
      const updated = [newFavorite, ...prev];
      if (updated.length > MAX_FAVORITES) {
        return updated.slice(0, MAX_FAVORITES);
      }
      return updated;
    });

    return true;
  }, [favorites]);

  // Remove favorite
  const removeFavorite = useCallback((path: string) => {
    setFavorites(prev => prev.filter(f => f.path !== path));
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((path: string, title: string, icon?: string) => {
    if (isFavorite(path)) {
      removeFavorite(path);
      return false;
    } else {
      addFavorite(path, title, icon);
      return true;
    }
  }, [favorites]);

  // Check if path is favorite
  const isFavorite = useCallback((path: string): boolean => {
    return favorites.some(f => f.path === path);
  }, [favorites]);

  // Reorder favorites
  const reorderFavorites = useCallback((fromIndex: number, toIndex: number) => {
    setFavorites(prev => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated;
    });
  }, []);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    reorderFavorites,
    clearFavorites,
    maxFavorites: MAX_FAVORITES,
  };
}
