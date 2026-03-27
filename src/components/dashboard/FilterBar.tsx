"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { SortOption } from "@/lib/types";
import ExportButton from "./ExportButton";

export default function FilterBar() {
  const { searchQuery, setSearchQuery, sortBy, setSortBy } =
    useBookmarkStore();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <Input
          placeholder="Search bookmarks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortOption)}
        className="h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
      >
        <option value="default">Sort: Default</option>
        <option value="category">Sort: Category</option>
        <option value="confidence">Sort: Confidence</option>
      </select>

      {/* Export */}
      <ExportButton />
    </div>
  );
}
