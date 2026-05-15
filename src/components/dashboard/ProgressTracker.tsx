"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useBookmarkStore } from "@/store/useBookmarkStore";

export default function ProgressTracker() {
  const { progress, status, errors, statusMessage } = useBookmarkStore();
  const percentage =
    progress.totalCount > 0
      ? Math.round((progress.processedCount / progress.totalCount) * 100)
      : 0;

  if (status !== "processing") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-2xl"
    >
      <div className="soft-shadow rounded-3xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
          <span className="font-display font-semibold text-text-primary">
            Processing batch {progress.currentBatch} of {progress.totalBatches}
            ...
          </span>
        </div>

        <div className="relative h-3 overflow-hidden rounded-full bg-tag-bg">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-cta"
            initial={{ width: "0%" }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-text-muted">
          <span>
            {progress.processedCount} / {progress.totalCount} bookmarks
          </span>
          <span>{percentage}%</span>
        </div>

        {statusMessage && (
          <p className="mt-3 text-sm text-text-secondary">{statusMessage}</p>
        )}

        {errors.length > 0 && (
          <div className="mt-4 space-y-2">
            {errors.map((error, index) => (
              <p
                key={index}
                className="rounded-xl border border-border bg-badge px-3 py-2 text-sm text-text-secondary"
              >
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
