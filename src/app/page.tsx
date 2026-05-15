"use client";

import { ExternalLink } from "lucide-react";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <header className="sticky top-0 z-30 border-b border-border bg-surface backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <span className="font-display text-lg font-bold text-text-primary">
              X Bookmark AI
            </span>
            <p className="text-sm text-text-muted">
              Organize your bookmarks with a cleaner, calmer workflow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-link transition-colors hover:text-text-primary"
            >
              <ExternalLink className="h-4 w-4" />
              GitHub
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <Hero />
      <HowItWorks />
      <Features />

      <footer className="border-t border-border py-12 px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-text-primary">
              X Bookmark AI
            </span>
            <span className="text-sm text-text-secondary">
              Powered by your preferred model
            </span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-link transition-colors hover:text-text-primary"
          >
            <ExternalLink className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
