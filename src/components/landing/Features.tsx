"use client";

import { motion } from "framer-motion";
import { Brain, FileDown, Search, Shield, Tags, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Categorization",
    description:
      "Choose hosted or local models and let them turn bookmarks into readable, specific summaries.",
  },
  {
    icon: Zap,
    title: "Efficient Batch Runs",
    description:
      "Bookmarks are processed in larger batches to cut request count and reduce overall cost.",
  },
  {
    icon: Shield,
    title: "Theme and Privacy Friendly",
    description:
      "Your dashboard now adapts to light or dark mode while keeping data in-browser except model requests.",
  },
  {
    icon: Tags,
    title: "Turkish-First Output",
    description:
      "Categories, tags, and summaries are generated in Turkish so the whole library stays consistent and easy to scan.",
  },
  {
    icon: Search,
    title: "Focused Search",
    description:
      "Filter by category, confidence, summary, or tags without losing context inside the dashboard.",
  },
  {
    icon: FileDown,
    title: "Export Anywhere",
    description:
      "Download your categorized bookmarks as JSON or CSV whenever you want to reuse them elsewhere.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Features() {
  return (
    <section className="relative px-6 py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--badge-bg)]/30 to-transparent" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-4xl font-bold text-text-primary md:text-5xl">
            Everything You <span className="gradient-text">Need</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
            A cleaner visual system wrapped around the same bookmark workflow.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="soft-shadow rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--text-muted)]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-badge">
                <feature.icon className="h-5 w-5 text-text-muted" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
