"use client";

import { motion } from "framer-motion";
import { Download, Upload, Zap } from "lucide-react";

const steps = [
  {
    icon: Download,
    step: "01",
    title: "Export Your X Data",
    description:
      "Go to X Settings and request your archive. You will receive a ZIP file containing your bookmarks.",
  },
  {
    icon: Upload,
    step: "02",
    title: "Upload bookmarks.js",
    description:
      "Extract the archive, open the data folder, and drag the bookmarks file into the app.",
  },
  {
    icon: Zap,
    step: "03",
    title: "Review AI Results",
    description:
      "The app batches your bookmarks, reuses cache when possible, and returns organized summaries you can filter or export.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="font-display text-4xl font-bold text-text-primary md:text-5xl">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
            Three steps from export file to a tidy bookmark library.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-3"
        >
          {steps.map((step) => (
            <motion.div key={step.step} variants={item} className="relative">
              <div className="soft-shadow h-full rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--text-muted)]">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-badge">
                    <step.icon className="h-6 w-6 text-text-muted" />
                  </div>
                  <span className="font-display text-3xl font-bold text-text-muted">
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-2 font-display text-xl font-semibold text-text-primary">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
