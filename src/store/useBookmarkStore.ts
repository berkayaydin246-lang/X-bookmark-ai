"use client";

import { useMemo } from "react";
import { create } from "zustand";
import {
  RawBookmark,
  CategorizedBookmark,
  ProcessingProgress,
  ProcessingStatus,
  SortOption,
  CategoryCount,
  Language,
} from "@/lib/types";
import { getCategoryColor } from "@/lib/colors";

interface BookmarkStore {
  // API Key
  apiKey: string | null;
  setApiKey: (key: string) => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Raw data
  rawBookmarks: RawBookmark[];
  setRawBookmarks: (bookmarks: RawBookmark[]) => void;
  fileName: string | null;
  fileSize: number | null;
  setFileInfo: (name: string, size: number) => void;

  // Processing
  status: ProcessingStatus;
  setStatus: (status: ProcessingStatus) => void;
  progress: ProcessingProgress;
  setProgress: (progress: ProcessingProgress) => void;
  errors: string[];
  addError: (error: string) => void;

  // Results
  bookmarks: CategorizedBookmark[];
  addBookmarks: (bookmarks: CategorizedBookmark[]) => void;

  // Filters
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;

  // Actions
  reset: () => void;
  startTime: number | null;
  setStartTime: (time: number) => void;
}

export const useBookmarkStore = create<BookmarkStore>((set) => ({
  apiKey: null,
  setApiKey: (key) => set({ apiKey: key }),

  language: "en",
  setLanguage: (lang) => set({ language: lang }),

  rawBookmarks: [],
  setRawBookmarks: (bookmarks) => set({ rawBookmarks: bookmarks }),
  fileName: null,
  fileSize: null,
  setFileInfo: (name, size) => set({ fileName: name, fileSize: size }),

  status: "idle",
  setStatus: (status) => set({ status }),
  progress: {
    currentBatch: 0,
    totalBatches: 0,
    processedCount: 0,
    totalCount: 0,
  },
  setProgress: (progress) => set({ progress }),
  errors: [],
  addError: (error) => set((s) => ({ errors: [...s.errors, error] })),

  bookmarks: [],
  addBookmarks: (newBookmarks) =>
    set((state) => ({ bookmarks: [...state.bookmarks, ...newBookmarks] })),

  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  sortBy: "default",
  setSortBy: (sort) => set({ sortBy: sort }),

  reset: () =>
    set(() => {
      if (typeof window !== "undefined") {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key?.startsWith("x-bookmark-ai-cache-v")) {
            keysToRemove.push(key);
          }
        }
        for (const key of keysToRemove) {
          sessionStorage.removeItem(key);
        }
      }

      return {
        rawBookmarks: [],
        fileName: null,
        fileSize: null,
        status: "idle",
        progress: {
          currentBatch: 0,
          totalBatches: 0,
          processedCount: 0,
          totalCount: 0,
        },
        errors: [],
        bookmarks: [],
        selectedCategory: null,
        searchQuery: "",
        sortBy: "default",
        startTime: null,
      };
    }),

  startTime: null,
  setStartTime: (time) => set({ startTime: time }),
}));

// --- Derived hooks using useMemo (stable references) ---

export function useCategories(): CategoryCount[] {
  const bookmarks = useBookmarkStore((s) => s.bookmarks);

  return useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of bookmarks) {
      counts[b.category] = (counts[b.category] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        color: getCategoryColor(name),
      }))
      .sort((a, b) => b.count - a.count);
  }, [bookmarks]);
}

export function useFilteredBookmarks(): CategorizedBookmark[] {
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const selectedCategory = useBookmarkStore((s) => s.selectedCategory);
  const searchQuery = useBookmarkStore((s) => s.searchQuery);
  const sortBy = useBookmarkStore((s) => s.sortBy);

  return useMemo(() => {
    let filtered = [...bookmarks];

    if (selectedCategory) {
      filtered = filtered.filter((b) => b.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.summary.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.tweetId.includes(q)
      );
    }

    if (sortBy === "category") {
      filtered.sort((a, b) => a.category.localeCompare(b.category));
    } else if (sortBy === "confidence") {
      const order = { high: 0, medium: 1, low: 2 };
      filtered.sort((a, b) => order[a.confidence] - order[b.confidence]);
    }

    return filtered;
  }, [bookmarks, selectedCategory, searchQuery, sortBy]);
}
