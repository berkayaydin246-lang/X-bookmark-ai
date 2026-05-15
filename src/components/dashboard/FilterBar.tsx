"use client";

import { Search } from "lucide-react";
import { SortOption } from "@/lib/types";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { Input } from "@/components/ui/input";
import ExportButton from "./ExportButton";

export default function FilterBar() {
  const { searchQuery, setSearchQuery, sortBy, setSortBy } =
    useBookmarkStore();

  return (
    <div className="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input
          placeholder="Search bookmarks..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="pl-9"
        />
      </div>

      <select
        value={sortBy}
        onChange={(event) => setSortBy(event.target.value as SortOption)}
        className="h-10 cursor-pointer rounded-xl border border-border bg-card px-3 text-sm text-text-primary focus:border-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)]"
      >
        <option value="default">Sort: Default</option>
        <option value="category">Sort: Category</option>
        <option value="confidence">Sort: Confidence</option>
      </select>

      <ExportButton />
    </div>
  );
}
