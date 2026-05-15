"use client";

import { motion } from "framer-motion";

export default function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="soft-shadow rounded-[12px] border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="h-6 w-28 animate-pulse rounded-full bg-badge" />
        <div className="h-5 w-14 animate-pulse rounded-full bg-badge" />
      </div>
      <div className="mb-3 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-tag-bg" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-tag-bg" />
      </div>
      <div className="mb-4 flex gap-2">
        <div className="h-5 w-20 animate-pulse rounded-md bg-tag-bg" />
        <div className="h-5 w-16 animate-pulse rounded-md bg-tag-bg" />
        <div className="h-5 w-24 animate-pulse rounded-md bg-tag-bg" />
      </div>
      <div className="h-4 w-24 animate-pulse rounded bg-tag-bg" />
    </motion.div>
  );
}
