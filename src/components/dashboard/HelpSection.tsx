"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, ExternalLink } from "lucide-react";

const steps = [
  {
    title: "Request your X data archive",
    content:
      'Go to X (Twitter) → Settings → Your Account → Download an archive of your data. Click "Request archive".',
  },
  {
    title: "Wait for the email",
    content:
      "X will email you when your archive is ready. This usually takes 24-48 hours.",
  },
  {
    title: "Download and extract the ZIP",
    content:
      'Download the ZIP file from the link in your email. Extract it to find a folder with your data.',
  },
  {
    title: "Find bookmarks.js",
    content:
      'Navigate to the /data folder inside the extracted archive. Look for the file named "bookmarks.js".',
  },
  {
    title: "Upload to this app",
    content:
      "Drag and drop the bookmarks.js file into the upload zone above, and let AI do the rest!",
  },
];

export default function HelpSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <HelpCircle className="w-4 h-4" />
        How to export your X data
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-6 rounded-xl bg-surface border border-border">
              <ol className="space-y-4">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-text-primary text-sm">
                        {step.title}
                      </p>
                      <p className="text-text-muted text-xs mt-0.5">
                        {step.content}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <a
                href="https://help.x.com/en/managing-your-account/how-to-download-your-x-archive"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-xs text-accent hover:text-accent-light transition-colors"
              >
                Official X guide
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
