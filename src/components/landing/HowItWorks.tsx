"use client";

import { motion } from "framer-motion";
import { Download, Upload, Zap } from "lucide-react";

const steps = [
  {
    icon: Download,
    step: "01",
    title: "Export Your X Data",
    description:
      "Go to X Settings → Download an archive of your data. You'll receive a ZIP file containing your bookmarks.",
  },
  {
    icon: Upload,
    step: "02",
    title: "Upload bookmarks.js",
    description:
      "Extract the ZIP and find the bookmarks.js file in the /data folder. Drag and drop it into the app.",
  },
  {
    icon: Zap,
    step: "03",
    title: "AI Categorizes Instantly",
    description:
      "Claude AI analyzes each bookmark and categorizes them with tags, summaries, and confidence scores.",
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
    <section id="how-it-works" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="mt-4 text-text-muted text-lg max-w-xl mx-auto">
            Three simple steps to transform your chaotic bookmarks into an
            organized knowledge base.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {steps.map((s) => (
            <motion.div
              key={s.step}
              variants={item}
              className="relative group"
            >
              <div className="p-8 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all duration-300 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <s.icon className="w-6 h-6 text-accent" />
                  </div>
                  <span className="text-text-muted/40 font-display text-3xl font-bold">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-text-primary mb-2">
                  {s.title}
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {s.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
