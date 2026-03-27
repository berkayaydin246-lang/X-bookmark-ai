"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, X } from "lucide-react";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { parseBookmarksFile } from "@/lib/parser";
import { toast } from "sonner";

export default function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const { setRawBookmarks, setFileInfo, setStatus, fileName, fileSize, rawBookmarks } =
    useBookmarkStore();

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
    [setRawBookmarks, setFileInfo, setStatus]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleClear = () => {
    useBookmarkStore.getState().reset();
  };

  const hasFile = rawBookmarks.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!hasFile ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                isDragging
                  ? "border-accent bg-accent/5 scale-[1.02]"
                  : "border-border hover:border-accent/40 hover:bg-surface/50"
              }`}
            >
              <input
                type="file"
                accept=".js,.json"
                className="hidden"
                onChange={handleFileInput}
              />
              <motion.div
                animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4"
              >
                <Upload className="w-8 h-8 text-accent" />
              </motion.div>
              <p className="font-display text-lg font-semibold text-text-primary mb-1">
                Drop your bookmarks file here
              </p>
              <p className="text-text-muted text-sm">
                Supports .js and .json — or click to browse
              </p>
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-2xl bg-surface border border-border"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">{fileName}</p>
                  <p className="text-text-muted text-sm">
                    {fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : ""} •{" "}
                    {rawBookmarks.length} bookmarks found
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-accent" />
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear file"
                  className="p-1.5 rounded-lg hover:bg-border/50 text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-background/50 border border-border/50">
              <div className="flex items-center gap-2 text-accent text-sm">
                <CheckCircle className="w-4 h-4" />
                Ready to categorize {rawBookmarks.length} bookmarks
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
