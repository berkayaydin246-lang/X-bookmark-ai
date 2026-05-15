"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bookmark,
  Clock,
  FolderOpen,
  RotateCcw,
} from "lucide-react";
import { useBookmarkStore, useCategories } from "@/store/useBookmarkStore";
import { Button } from "@/components/ui/button";

interface Props {
  onClearCache: () => void;
  reprocessCount: number;
}

export default function StatsBar({ onClearCache, reprocessCount }: Props) {
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const startTime = useBookmarkStore((state) => state.startTime);
  const errors = useBookmarkStore((state) => state.errors);
  const categories = useCategories();

  const elapsed = startTime
    ? ((Date.now() - startTime) / 1000).toFixed(1)
    : "0";

  const stats = [
    {
      icon: Bookmark,
      label: "Total Bookmarks",
      value: bookmarks.length,
    },
    {
      icon: FolderOpen,
      label: "Categories",
      value: categories.length,
    },
    {
      icon: Clock,
      label: "Processing Time",
      value: `${elapsed}s`,
    },
    {
      icon: AlertTriangle,
      label: "Errors",
      value: errors.length,
    },
  ];

  return (
    <div className="mb-6 space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="soft-shadow rounded-2xl border border-border bg-card p-4"
          >
            <div className="mb-1 flex items-center gap-2">
              <stat.icon className="h-4 w-4 text-text-muted" />
              <span className="text-xs text-text-muted">{stat.label}</span>
            </div>
            <p className="font-display text-2xl font-bold text-text-primary">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {reprocessCount > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClearCache}>
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Clear Cache &amp; Re-process
          </Button>
        </div>
      )}
    </div>
  );
}
