"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { parseBookmarksFile } from "@/lib/parser";
import { useBookmarkStore } from "@/store/useBookmarkStore";

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const {
    setRawBookmarks,
    setFileInfo,
    setStatus,
    fileName,
    fileSize,
    rawBookmarks,
  } = useBookmarkStore();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".js") && !file.name.endsWith(".json")) {
        toast.error("Please upload a bookmarks.js or .json file.");
        return;
      }

      setStatus("parsing");
      setFileInfo(file.name, file.size);

      try {
        const content = await file.text();
        const bookmarks = parseBookmarksFile(content);
        setRawBookmarks(bookmarks);
        setStatus("idle");
        toast.success(`Found ${bookmarks.length} bookmarks!`);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to parse file.";
        toast.error(message);
        setStatus("error");
      }
    },
    [setFileInfo, setRawBookmarks, setStatus]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClear = () => {
    useBookmarkStore.getState().reset();
  };

  const hasFile = rawBookmarks.length > 0;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <AnimatePresence mode="wait">
        {!hasFile ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <label
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`soft-shadow relative flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-card transition-all duration-300 ${
                isDragging
                  ? "border-[var(--text-muted)] bg-surface"
                  : "border-border hover:border-[var(--text-muted)] hover:bg-surface"
              }`}
            >
              <input
                type="file"
                accept=".js,.json"
                className="hidden"
                onChange={handleFileInput}
              />
              <motion.div
                animate={isDragging ? { scale: 1.08 } : { scale: 1 }}
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-badge"
              >
                <Upload className="h-8 w-8 text-text-muted" />
              </motion.div>
              <p className="mb-1 font-display text-lg font-semibold text-text-primary">
                Drop your bookmarks file here
              </p>
              <p className="text-sm text-text-secondary">
                Supports .js and .json, or click to browse
              </p>
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="soft-shadow rounded-3xl border border-border bg-card p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-badge">
                  <FileText className="h-6 w-6 text-text-muted" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{fileName}</p>
                  <p className="text-sm text-text-secondary">
                    {fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : ""} •{" "}
                    {rawBookmarks.length} bookmarks found
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-text-muted" />
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear file"
                  className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-border bg-surface p-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle className="h-4 w-4 text-text-muted" />
                Ready to categorize {rawBookmarks.length} bookmarks
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
