"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink, HelpCircle } from "lucide-react";

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
      "Download the ZIP file from the email link and extract it to access the data folder.",
  },
  {
    title: "Find bookmarks.js",
    content:
      'Navigate to the extracted data folder and locate the file named "bookmarks.js".',
  },
  {
    title: "Upload to this app",
    content:
      "Drag and drop the file into the upload area above and let the categorizer do the rest.",
  },
];

export default function HelpSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mx-auto mt-6 w-full max-w-2xl">
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
      >
        <HelpCircle className="h-4 w-4 text-text-muted" />
        How to export your X data
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
            <div className="soft-shadow mt-4 rounded-2xl border border-border bg-card p-6">
              <ol className="space-y-4">
                {steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-badge text-xs font-bold text-text-secondary">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
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
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-link transition-colors hover:text-text-primary"
              >
                Official X guide
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
