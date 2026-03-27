"use client";

import { motion } from "framer-motion";
import { Bookmark, FolderOpen, Clock, AlertTriangle } from "lucide-react";
import { useBookmarkStore, useCategories } from "@/store/useBookmarkStore";

export default function StatsBar() {
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const startTime = useBookmarkStore((s) => s.startTime);
  const errors = useBookmarkStore((s) => s.errors);
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-xl bg-surface border border-border"
        >
          <div className="flex items-center gap-2 mb-1">
            <stat.icon className="w-4 h-4 text-accent" />
            <span className="text-text-muted text-xs">{stat.label}</span>
          </div>
          <p className="font-display text-2xl font-bold text-text-primary">
            {stat.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
