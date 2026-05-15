"use client";

import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import { getCategoryColor } from "@/lib/colors";
import { normalizeCategory } from "@/lib/categorizer";
import { useBookmarkStore, useCategories } from "@/store/useBookmarkStore";

export default function CategorySidebar() {
  const categories = useCategories();
  const selectedCategory = useBookmarkStore((state) => state.selectedCategory);
  const setSelectedCategory = useBookmarkStore(
    (state) => state.setSelectedCategory
  );
  const bookmarkCount = useBookmarkStore((state) => state.bookmarks.length);

  return (
    <div className="w-full flex-shrink-0 lg:w-64">
      <div className="sticky top-6 rounded-3xl border border-border bg-surface p-3">
        <h3 className="mb-3 px-3 text-sm font-semibold text-text-primary">
          Categories
        </h3>

        <button
          onClick={() => setSelectedCategory(null)}
          className={`mb-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
            !selectedCategory
              ? "border border-border bg-badge text-text-secondary"
              : "text-text-secondary hover:bg-card hover:text-text-primary"
          }`}
        >
          <span className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-text-muted" />
            All
          </span>
          <span className="text-xs text-text-muted">{bookmarkCount}</span>
        </button>

        <div className="space-y-1">
          {categories.map((category, index) => {
            const normalizedName = normalizeCategory(category.name);
            const isSelected = selectedCategory === normalizedName;
            const categoryColor = getCategoryColor(normalizedName);

            return (
              <motion.button
                key={normalizedName}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() =>
                  setSelectedCategory(isSelected ? null : normalizedName)
                }
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-all duration-200 ${
                  isSelected
                    ? "border border-border bg-badge text-text-secondary"
                    : "text-text-secondary hover:bg-card hover:text-text-primary"
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: categoryColor.text }}
                  />
                  <span className="truncate">{normalizedName}</span>
                </span>
                <span className="ml-2 flex-shrink-0 text-xs text-text-muted">
                  {category.count}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
