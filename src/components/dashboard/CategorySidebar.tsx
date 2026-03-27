"use client";

import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import { useBookmarkStore, useCategories } from "@/store/useBookmarkStore";
import { getCategoryColor } from "@/lib/colors";

export default function CategorySidebar() {
  const categories = useCategories();
  const selectedCategory = useBookmarkStore((s) => s.selectedCategory);
  const setSelectedCategory = useBookmarkStore((s) => s.setSelectedCategory);
  const bookmarkCount = useBookmarkStore((s) => s.bookmarks.length);

  return (
    <div className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-6 space-y-1">
        <h3 className="font-display font-semibold text-text-primary text-sm mb-3 px-3">
          Categories
        </h3>

        <button
          onClick={() => setSelectedCategory(null)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
            !selectedCategory
              ? "bg-accent/10 text-accent"
              : "text-text-muted hover:text-text-primary hover:bg-surface"
          }`}
        >
          <span className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            All
          </span>
          <span className="text-xs opacity-70">{bookmarkCount}</span>
        </button>

        <div className="space-y-0.5">
          {categories.map((cat, index) => {
            const color = getCategoryColor(cat.name);
            const isSelected = selectedCategory === cat.name;

            return (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() =>
                  setSelectedCategory(isSelected ? null : cat.name)
                }
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  isSelected
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-primary hover:bg-surface"
                }`}
                style={
                  isSelected
                    ? { backgroundColor: `${color}15`, color: color }
                    : {}
                }
              >
                <span className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className="text-xs opacity-70 flex-shrink-0 ml-2">
                  {cat.count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
