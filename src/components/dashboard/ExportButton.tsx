"use client";

import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { exportBookmarks } from "@/lib/export";
import { ExportFormat } from "@/lib/types";
import { toast } from "sonner";

export default function ExportButton() {
  const [open, setOpen] = useState(false);
  const { bookmarks } = useBookmarkStore();

  const handleExport = (format: ExportFormat) => {
    if (bookmarks.length === 0) {
      toast.error("No bookmarks to export.");
      return;
    }
    exportBookmarks(bookmarks, format);
    toast.success(`${bookmarks.length} bookmarks exported as ${format.toUpperCase()}!`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={() => setOpen(!open)}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-40 rounded-lg bg-surface border border-border shadow-xl z-50 overflow-hidden">
            <button
              onClick={() => handleExport("json")}
              className="w-full px-4 py-2.5 text-sm text-left text-text-primary hover:bg-border/30 transition-colors"
            >
              Export as JSON
            </button>
            <button
              onClick={() => handleExport("csv")}
              className="w-full px-4 py-2.5 text-sm text-left text-text-primary hover:bg-border/30 transition-colors"
            >
              Export as CSV
            </button>
          </div>
        </>
      )}
    </div>
  );
}
