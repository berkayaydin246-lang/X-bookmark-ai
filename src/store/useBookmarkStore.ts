"use client";

import { useMemo } from "react";
import { create } from "zustand";
import {
  ApiKeys,
  RawBookmark,
  CategorizedBookmark,
  ProcessingProgress,
  ProcessingStatus,
  SortOption,
  CategoryCount,
  Language,
  SupportedModelId,
} from "@/lib/types";
import { getCategoryColor } from "@/lib/colors";
import {
  normalizeCategorizedBookmark,
  normalizeCategory,
} from "@/lib/categorizer";

interface BookmarkStore {
  // Model settings
  selectedModel: SupportedModelId;
  setSelectedModel: (model: SupportedModelId) => void;
  apiKeys: ApiKeys;
  setApiKey: (provider: keyof ApiKeys, key: string) => void;
  ollamaModel: string;
  setOllamaModel: (model: string) => void;
  hydrateSettings: (settings: {
    selectedModel?: SupportedModelId;
    apiKeys?: Partial<ApiKeys>;
    ollamaModel?: string;
  }) => void;

  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;
  initializeTheme: () => void;

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
  setErrors: (errors: string[]) => void;
  statusMessage: string | null;
  setStatusMessage: (message: string | null) => void;

  // Results
  bookmarks: CategorizedBookmark[];
  setBookmarks: (bookmarks: CategorizedBookmark[]) => void;
  addBookmarks: (bookmarks: CategorizedBookmark[]) => void;

  // Filters
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;

  // Actions
  prepareForRun: () => void;
  resetForReprocess: () => void;
  reset: () => void;
  startTime: number | null;
  setStartTime: (time: number) => void;
}

export const useBookmarkStore = create<BookmarkStore>((set) => ({
  selectedModel: "anthropic-haiku",
  setSelectedModel: (model) => set({ selectedModel: model }),
  apiKeys: {
    anthropic: "",
    groq: "",
    gemini: "",
  },
  setApiKey: (provider, key) =>
    set((state) => ({
      apiKeys: {
        ...state.apiKeys,
        [provider]: key,
      },
    })),
  ollamaModel: "llama3",
  setOllamaModel: (model) => set({ ollamaModel: model }),
  hydrateSettings: (settings) =>
    set((state) => ({
      selectedModel: settings.selectedModel ?? state.selectedModel,
      apiKeys: settings.apiKeys
        ? {
            ...state.apiKeys,
            ...settings.apiKeys,
          }
        : state.apiKeys,
      ollamaModel: settings.ollamaModel ?? state.ollamaModel,
    })),

  theme: "dark",
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";

      if (typeof window !== "undefined") {
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
        localStorage.setItem("x-bookmark-ai-theme", nextTheme);
      }

      return {
        theme: nextTheme,
      };
    }),
  initializeTheme: () =>
    set(() => {
      if (typeof window === "undefined") {
        return { theme: "dark" as const };
      }

      const storedTheme = localStorage.getItem("x-bookmark-ai-theme");
      const nextTheme =
        storedTheme === "light" || storedTheme === "dark"
          ? storedTheme
          : document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";

      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      localStorage.setItem("x-bookmark-ai-theme", nextTheme);

      return {
        theme: nextTheme,
      };
    }),

  language: "tr",
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
  setErrors: (errors) => set({ errors }),
  statusMessage: null,
  setStatusMessage: (message) => set({ statusMessage: message }),

  bookmarks: [],
  setBookmarks: (bookmarks) =>
    set({ bookmarks: bookmarks.map(normalizeCategorizedBookmark) }),
  addBookmarks: (newBookmarks) =>
    set((state) => ({
      bookmarks: [
        ...state.bookmarks,
        ...newBookmarks.map(normalizeCategorizedBookmark),
      ],
    })),

  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  sortBy: "default",
  setSortBy: (sort) => set({ sortBy: sort }),

  prepareForRun: () =>
    set(() => ({
      status: "processing",
      progress: {
        currentBatch: 0,
        totalBatches: 0,
        processedCount: 0,
        totalCount: 0,
      },
      errors: [],
      statusMessage: null,
      bookmarks: [],
      selectedCategory: null,
      searchQuery: "",
      sortBy: "default",
    })),

  resetForReprocess: () =>
    set(() => ({
      status: "idle",
      progress: {
        currentBatch: 0,
        totalBatches: 0,
        processedCount: 0,
        totalCount: 0,
      },
      errors: [],
      statusMessage: null,
      bookmarks: [],
      selectedCategory: null,
      searchQuery: "",
      sortBy: "default",
      startTime: null,
    })),

  reset: () =>
    set(() => {
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
        statusMessage: null,
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
      const normalizedCategory = normalizeCategory(b.category);
      counts[normalizedCategory] = (counts[normalizedCategory] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        color: getCategoryColor(name).text,
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
      filtered = filtered.filter(
        (b) => normalizeCategory(b.category) === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.summary.toLowerCase().includes(q) ||
          normalizeCategory(b.category).toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.tweetId.includes(q)
      );
    }

    if (sortBy === "category") {
      filtered.sort((a, b) =>
        normalizeCategory(a.category).localeCompare(normalizeCategory(b.category))
      );
    } else if (sortBy === "confidence") {
      const order = { high: 0, medium: 1, low: 2 };
      filtered.sort((a, b) => order[a.confidence] - order[b.confidence]);
    }

    return filtered;
  }, [bookmarks, selectedCategory, searchQuery, sortBy]);
}
