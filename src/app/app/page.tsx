"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bookmark, RotateCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ApiKeyModal from "@/components/dashboard/ApiKeyModal";
import BookmarkCard from "@/components/dashboard/BookmarkCard";
import CategorySidebar from "@/components/dashboard/CategorySidebar";
import CostEstimator from "@/components/dashboard/CostEstimator";
import FileUploader from "@/components/dashboard/FileUploader";
import FilterBar from "@/components/dashboard/FilterBar";
import HelpSection from "@/components/dashboard/HelpSection";
import ProgressTracker from "@/components/dashboard/ProgressTracker";
import SkeletonCard from "@/components/dashboard/SkeletonCard";
import StatsBar from "@/components/dashboard/StatsBar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  getActiveApiKey,
  getConfiguredModelName,
  getModelOption,
  isModelConfigured,
} from "@/lib/ai";
import {
  clearBookmarkCache,
  getCachedBookmarks,
  getProcessingEstimate,
  processBatches,
} from "@/lib/categorizer";
import {
  useBookmarkStore,
  useFilteredBookmarks,
} from "@/store/useBookmarkStore";
import { ApiKeys, SupportedModelId } from "@/lib/types";

const SETTINGS_STORAGE_KEY = "x-bookmark-ai-settings-v1";

export default function AppPage() {
  const store = useBookmarkStore();
  const filteredBookmarks = useFilteredBookmarks();
  const hydrateSettings = useBookmarkStore((state) => state.hydrateSettings);
  const [mounted, setMounted] = useState(false);

  const isConfigured = useMemo(
    () =>
      isModelConfigured(store.selectedModel, store.apiKeys, store.ollamaModel),
    [store.selectedModel, store.apiKeys, store.ollamaModel]
  );

  const activeModelOption = useMemo(
    () => getModelOption(store.selectedModel),
    [store.selectedModel]
  );

  const activeApiKey = useMemo(
    () => getActiveApiKey(store.selectedModel, store.apiKeys),
    [store.selectedModel, store.apiKeys]
  );

  useEffect(() => {
    const savedSettings = sessionStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as {
          selectedModel?: SupportedModelId;
          apiKeys?: ApiKeys;
          ollamaModel?: string;
        };
        hydrateSettings(parsed);
        setMounted(true);
        return;
      } catch {
        sessionStorage.removeItem(SETTINGS_STORAGE_KEY);
      }
    }

    const legacyAnthropicKey = sessionStorage.getItem("anthropic-key");
    if (legacyAnthropicKey) {
      hydrateSettings({
        selectedModel: "anthropic-haiku",
        apiKeys: {
          anthropic: legacyAnthropicKey,
        },
      });
    }

    setMounted(true);
  }, [hydrateSettings]);

  useEffect(() => {
    if (!mounted) return;

    sessionStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        selectedModel: store.selectedModel,
        apiKeys: store.apiKeys,
        ollamaModel: store.ollamaModel,
      })
    );
  }, [
    mounted,
    store.selectedModel,
    store.apiKeys,
    store.ollamaModel,
  ]);

  const handleStart = async () => {
    if (!isConfigured || store.rawBookmarks.length === 0) return;

    store.prepareForRun();
    store.setStartTime(Date.now());

    try {
      const result = await processBatches({
        rawBookmarks: store.rawBookmarks,
        selectedModel: store.selectedModel,
        apiKey: activeApiKey,
        ollamaModel: store.ollamaModel,
        language: store.language,
        onBatchComplete: (batchResults) => {
          store.addBookmarks(batchResults);
        },
        onProgress: (progress) => {
          store.setProgress(progress);
        },
        onError: (error) => {
          store.addError(error);
        },
        onStatusMessage: (message) => {
          store.setStatusMessage(message);
        },
      });

      if (result.failedBatches > 0 && result.results.length === 0) {
        store.setStatus("error");
        return;
      }

      store.setStatus("complete");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to categorize bookmarks.";
      store.addError(message);
      store.setStatusMessage(message);
      store.setStatus("error");
    }
  };

  const handleUseCachedOnly = () => {
    if (store.rawBookmarks.length === 0) return;

    const cachedBookmarks = getCachedBookmarks(store.rawBookmarks);
    const estimate = getProcessingEstimate(
      store.rawBookmarks,
      store.selectedModel
    );

    if (cachedBookmarks.length === 0) {
      toast.error("No cached bookmarks found.");
      return;
    }

    store.prepareForRun();
    store.setStartTime(Date.now());
    store.setBookmarks(cachedBookmarks);
    store.setProgress({
      currentBatch: 0,
      totalBatches: 0,
      processedCount: cachedBookmarks.length,
      totalCount: estimate.totalBookmarks,
    });
    store.setStatusMessage(
      `${cachedBookmarks.length} loaded from cache. ${estimate.toProcessCount} uncached bookmarks were skipped.`
    );
    store.setStatus("complete");

    toast.success(
      `Loaded ${cachedBookmarks.length} cached bookmarks. ${estimate.toProcessCount} uncached bookmarks were skipped.`
    );
  };

  const handleClearCache = () => {
    const totalBookmarks =
      store.rawBookmarks.length > 0
        ? getProcessingEstimate(
            store.rawBookmarks,
            store.selectedModel
          ).totalBookmarks
        : store.bookmarks.length;

    if (
      totalBookmarks > 0 &&
      !window.confirm(
        `This will delete all cached results and re-process ${totalBookmarks} bookmarks. Continue?`
      )
    ) {
      return;
    }

    clearBookmarkCache();
    store.resetForReprocess();

    toast.success(
      totalBookmarks > 0
        ? `Cache cleared — ${totalBookmarks} bookmarks will be re-processed`
        : "Cache cleared. Ready to re-process all bookmarks."
    );
  };

  const handleReset = () => {
    store.reset();
  };

  if (!mounted) return null;

  if (!isConfigured) {
    return <ApiKeyModal />;
  }

  if (store.status === "complete" && store.bookmarks.length > 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b border-border bg-surface backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Bookmark className="h-5 w-5 text-text-muted" />
              <div>
                <h1 className="font-display text-lg font-bold text-text-primary">
                  X Bookmark AI
                </h1>
                <p className="text-xs text-text-secondary">
                  {activeModelOption.label} ·{" "}
                  {getConfiguredModelName(
                    store.selectedModel,
                    store.ollamaModel
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Start Over
              </Button>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <StatsBar
            onClearCache={handleClearCache}
            reprocessCount={store.rawBookmarks.length}
          />

          <div className="flex flex-col gap-8 lg:flex-row">
            <CategorySidebar />

            <div className="min-w-0 flex-1">
              <FilterBar />

              {filteredBookmarks.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-lg text-text-muted">
                    No bookmarks match your search.
                  </p>
                </div>
              ) : (
                <div
                  className="grid items-stretch gap-3"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    alignItems: "stretch",
                  }}
                >
                  {filteredBookmarks.map((bookmark, index) => (
                    <BookmarkCard
                      key={bookmark.tweetId}
                      bookmark={bookmark}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Bookmark className="h-5 w-5 text-text-muted" />
            <div>
              <h1 className="font-display text-lg font-bold text-text-primary">
                X Bookmark AI
              </h1>
              <p className="text-xs text-text-secondary">
                {activeModelOption.label} ·{" "}
                {getConfiguredModelName(store.selectedModel, store.ollamaModel)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
            Upload Your Bookmarks
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-lg text-text-secondary">
            Drop your <code className="rounded bg-tag-bg px-1 py-0.5 text-tag-text">bookmarks.js</code> or{" "}
            <code className="rounded bg-tag-bg px-1 py-0.5 text-tag-text">.json</code> file and we&apos;ll batch
            everything in groups of 25 for cheaper runs.
          </p>
        </motion.div>

        <FileUploader />
        <HelpSection />

        {store.rawBookmarks.length > 0 && store.status !== "processing" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-text-secondary">
                All summaries, tags, and categories are generated in Turkish.
              </p>
              {store.selectedModel === "ollama" && (
                <p className="max-w-xl text-center text-sm text-text-secondary">
                  Using Ollama — completely free and private. Make sure Ollama is
                  running on your machine.
                </p>
              )}
            </div>

            <CostEstimator
              rawBookmarks={store.rawBookmarks}
              selectedModel={store.selectedModel}
              isProcessing={false}
              onStart={handleStart}
              onUseCachedOnly={handleUseCachedOnly}
              onClearCache={handleClearCache}
            />
          </motion.div>
        )}

        <AnimatePresence>
          {store.status === "processing" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8"
            >
              <ProgressTracker />

              {store.bookmarks.length === 0 && (
                <div
                  className="mx-auto mt-8 grid max-w-[960px] items-stretch gap-3"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    alignItems: "stretch",
                  }}
                >
                  {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonCard key={index} index={index} />
                  ))}
                </div>
              )}

              {store.bookmarks.length > 0 && (
                <div className="mt-8">
                  <p className="mb-4 text-center text-sm text-text-muted">
                    {store.bookmarks.length} bookmarks categorized so far...
                  </p>
                  <div
                    className="mx-auto grid max-w-[960px] items-stretch gap-3"
                    style={{
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                      alignItems: "stretch",
                    }}
                  >
                    {store.bookmarks.slice(-4).map((bookmark, index) => (
                      <BookmarkCard
                        key={bookmark.tweetId}
                        bookmark={bookmark}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {store.status === "error" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center"
          >
            <p className="mb-4 text-text-secondary">
              Something went wrong. Please try again.
            </p>
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
