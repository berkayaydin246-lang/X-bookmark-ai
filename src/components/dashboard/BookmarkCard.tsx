"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { CategorizedBookmark } from "@/lib/types";
import { getCategoryColor } from "@/lib/colors";

interface Props {
  bookmark: CategorizedBookmark;
  index: number;
}

export default function BookmarkCard({ bookmark, index }: Props) {
  const color = getCategoryColor(bookmark.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group p-5 rounded-xl bg-surface border border-border hover:border-opacity-60 transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
      style={{ borderColor: `${color}20` }}
    >
      {/* Category badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border"
          style={{
            backgroundColor: `${color}15`,
            color: color,
            borderColor: `${color}30`,
          }}
        >
          {bookmark.category}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            bookmark.confidence === "high"
              ? "bg-green-500/10 text-green-400"
              : bookmark.confidence === "medium"
              ? "bg-yellow-500/10 text-yellow-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          {bookmark.confidence}
        </span>
      </div>

      {/* Summary */}
      <p className="text-text-primary text-sm leading-relaxed mb-3">
        {bookmark.summary}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {bookmark.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs text-text-muted bg-background/60 px-2 py-0.5 rounded-md"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Link */}
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-light transition-colors group-hover:underline"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        View on X
      </a>
    </motion.div>
  );
}
