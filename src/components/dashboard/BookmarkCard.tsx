"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { getCategoryBadgeStyle } from "@/lib/colors";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { CategorizedBookmark } from "@/lib/types";

interface Props {
  bookmark: CategorizedBookmark;
  index: number;
}

export default function BookmarkCard({ bookmark, index }: Props) {
  const theme = useBookmarkStore((state) => state.theme);
  const badgeStyle = getCategoryBadgeStyle(bookmark.category, theme);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.02 }}
      whileHover={{ y: -1, transition: { duration: 0.16 } }}
      className="h-full rounded-[12px] border border-border bg-card p-[14px] transition-colors duration-150 hover:border-[var(--text-secondary)]"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-2">
          <span
            style={{
              backgroundColor: badgeStyle.backgroundColor,
              color: badgeStyle.color,
              padding: "2px 8px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 600,
            }}
            className="inline-flex max-w-[70%] items-center truncate"
          >
            {bookmark.category}
          </span>

          <span className="inline-flex items-center rounded-full bg-tag-bg px-2 py-0.5 text-[11px] font-medium capitalize text-tag-text">
            {bookmark.confidence}
          </span>
        </div>

        <div className="my-3 flex-1">
          <p className="text-[15px] leading-[1.65] text-text-primary">
            {bookmark.summary}
          </p>
        </div>

        <div className="mt-auto">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {bookmark.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-tag-bg px-1.5 py-0.5 text-[10px] text-tag-text"
              >
                #{tag}
              </span>
            ))}
          </div>

          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-link transition-colors hover:underline"
          >
            <span>View on X</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
