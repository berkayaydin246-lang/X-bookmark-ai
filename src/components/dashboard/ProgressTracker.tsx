"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useBookmarkStore } from "@/store/useBookmarkStore";

export default function ProgressTracker() {
  const { progress, status, errors } = useBookmarkStore();
  const percentage =
    progress.totalCount > 0
      ? Math.round((progress.processedCount / progress.totalCount) * 100)
      : 0;

  if (status !== "processing") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="p-6 rounded-2xl bg-surface border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 className="w-5 h-5 text-accent animate-spin" />
          <span className="font-display font-semibold text-text-primary">
            Processing batch {progress.currentBatch} of{" "}
            {progress.totalBatches}...
          </span>
        </div>

        <div className="relative h-3 rounded-full bg-background overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent to-accent-light"
            initial={{ width: "0%" }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between mt-3 text-sm text-text-muted">
          <span>
            {progress.processedCount} / {progress.totalCount} bookmarks
          </span>
          <span>{percentage}%</span>
        </div>

        {errors.length > 0 && (
          <div className="mt-4 space-y-2">
            {errors.map((err, i) => (
              <p key={i} className="text-red-400 text-sm">
                {err}
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
