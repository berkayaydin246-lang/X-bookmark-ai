"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-4.5rem)] items-center justify-center overflow-hidden px-6 py-20">
      <div className="absolute inset-0">
        <div className="absolute left-[12%] top-[15%] h-72 w-72 rounded-full bg-badge opacity-70 blur-[110px]" />
        <div className="absolute bottom-[12%] right-[14%] h-80 w-80 rounded-full bg-tag-bg opacity-80 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-badge px-4 py-2 text-sm font-medium text-text-secondary">
            <Sparkles className="h-4 w-4 text-text-muted" />
            AI-Powered Bookmark Intelligence
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl font-bold leading-[1.02] tracking-tight text-text-primary md:text-7xl lg:text-8xl"
        >
          Your bookmarks,
          <br />
          <span className="gradient-text">finally organized.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary md:text-xl"
        >
          Upload your X data export and let AI sort hundreds of bookmarks into a
          focused dashboard with summaries, tags, and category-based filtering.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Link href="/app">
            <Button size="lg" className="group text-base font-semibold">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="outline" size="lg" className="text-base">
              See How It Works
            </Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted"
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-text-muted" />
            No sign-up required
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-text-muted" />
            Your data stays private
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-text-muted" />
            Works with hosted or local models
          </span>
        </motion.div>
      </div>
    </section>
  );
}
