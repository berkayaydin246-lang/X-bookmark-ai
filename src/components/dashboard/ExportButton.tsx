"use client";

import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { toast } from "sonner";
import { exportBookmarks } from "@/lib/export";
import { ExportFormat } from "@/lib/types";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { Button } from "@/components/ui/button";

export default function ExportButton() {
  const [open, setOpen] = useState(false);
  const { bookmarks } = useBookmarkStore();

  const handleExport = (format: ExportFormat) => {
    if (bookmarks.length === 0) {
      toast.error("No bookmarks to export.");
      return;
    }

    exportBookmarks(bookmarks, format);
    toast.success(
      `${bookmarks.length} bookmarks exported as ${format.toUpperCase()}!`
    );
    setOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setOpen((value) => !value)}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="soft-shadow absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-card">
            <button
              onClick={() => handleExport("json")}
              className="w-full px-4 py-2.5 text-left text-sm text-text-primary transition-colors hover:bg-surface"
            >
              Export as JSON
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="w-full px-4 py-2.5 text-left text-sm text-text-primary transition-colors hover:bg-surface"
            >
              Export as CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}
