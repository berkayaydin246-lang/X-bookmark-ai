"use client";

import { motion } from "framer-motion";

export default function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-5 rounded-xl bg-surface border border-border"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 w-28 rounded-md bg-border animate-pulse" />
        <div className="h-5 w-14 rounded-full bg-border animate-pulse" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 w-full rounded bg-border animate-pulse" />
        <div className="h-4 w-3/4 rounded bg-border animate-pulse" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-20 rounded-md bg-border animate-pulse" />
        <div className="h-5 w-16 rounded-md bg-border animate-pulse" />
        <div className="h-5 w-24 rounded-md bg-border animate-pulse" />
      </div>
      <div className="h-4 w-24 rounded bg-border animate-pulse" />
    </motion.div>
  );
}
