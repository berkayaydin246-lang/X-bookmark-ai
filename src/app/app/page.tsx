"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, RotateCcw, Bookmark } from "lucide-react";
import Link from "next/link";
import { useBookmarkStore, useFilteredBookmarks } from "@/store/useBookmarkStore";
import { processBatches } from "@/lib/categorizer";
import { Button } from "@/components/ui/button";
import ApiKeyModal from "@/components/dashboard/ApiKeyModal";
import FileUploader from "@/components/dashboard/FileUploader";
import HelpSection from "@/components/dashboard/HelpSection";
import LanguageSelector from "@/components/dashboard/LanguageSelector";
import ProgressTracker from "@/components/dashboard/ProgressTracker";
import StatsBar from "@/components/dashboard/StatsBar";
import FilterBar from "@/components/dashboard/FilterBar";
import CategorySidebar from "@/components/dashboard/CategorySidebar";
import BookmarkCard from "@/components/dashboard/BookmarkCard";
import SkeletonCard from "@/components/dashboard/SkeletonCard";

export default function AppPage() {
  const store = useBookmarkStore();
  const filteredBookmarks = useFilteredBookmarks();
  const [mounted, setMounted] = useState(false);

  const setApiKey = store.setApiKey;

  useEffect(() => {
    setMounted(true);
    const saved = sessionStorage.getItem("anthropic-key");
    if (saved) {
      setApiKey(saved);
    }
  }, [setApiKey]);

  const handleStart = async () => {
    if (!store.apiKey || store.rawBookmarks.length === 0) return;

    store.setStatus("processing");
    store.setStartTime(Date.now());

    await processBatches(
      store.rawBookmarks,
      store.apiKey,
      store.language,
      (batchResults) => {
        store.addBookmarks(batchResults);
      },
      (progress) => {
        store.setProgress(progress);
      },
      (error) => {
        store.addError(error);
      }
    );

    store.setStatus("complete");
  };

  const handleReset = () => {
    store.reset();
  };

  if (!mounted) return null;

  if (!store.apiKey) {
    return <ApiKeyModal />;
  }

  // Results dashboard
  if (store.status === "complete" && store.bookmarks.length > 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-accent" />
              <h1 className="font-display text-lg font-bold text-text-primary">
                X Bookmark AI
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <StatsBar />

          <div className="flex flex-col lg:flex-row gap-8">
            <CategorySidebar />

            <div className="flex-1 min-w-0">
              <FilterBar />

              {filteredBookmarks.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-text-muted text-lg">
                    No bookmarks match your search.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

  // Upload & processing view
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bookmark className="w-5 h-5 text-accent" />
            <h1 className="font-display text-lg font-bold text-text-primary">
              X Bookmark AI
            </h1>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Upload Your Bookmarks
          </h2>
          <p className="text-text-muted text-lg max-w-lg mx-auto">
            Drop your <code className="text-accent">bookmarks.js</code> or{" "}
            <code className="text-accent">.json</code> file and let AI organize
            everything.
          </p>
        </motion.div>

        <FileUploader />
        <HelpSection />

        {/* Language + Start */}
        {store.rawBookmarks.length > 0 && store.status !== "processing" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-text-muted text-sm">Output language:</span>
              <LanguageSelector />
            </div>
            <Button
              size="lg"
              onClick={handleStart}
              className="group text-base font-semibold"
            >
              <Zap className="w-5 h-5 mr-2 group-hover:text-yellow-300 transition-colors" />
              Start Categorizing {store.rawBookmarks.length} Bookmarks
            </Button>
          </motion.div>
        )}

        {/* Processing state */}
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
                <div className="grid sm:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} index={i} />
                  ))}
                </div>
              )}

              {store.bookmarks.length > 0 && (
                <div className="mt-8">
                  <p className="text-text-muted text-sm mb-4 text-center">
                    {store.bookmarks.length} bookmarks categorized so far...
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
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

        {/* Error state */}
        {store.status === "error" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center"
          >
            <p className="text-red-400 mb-4">
              Something went wrong. Please try again.
            </p>
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
