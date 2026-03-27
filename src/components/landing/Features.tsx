"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Zap,
  Shield,
  Tags,
  Search,
  FileDown,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Categorization",
    description:
      "Claude AI intelligently groups your bookmarks into meaningful categories like AI, Design, Finance, and more.",
  },
  {
    icon: Zap,
    title: "500+ Bookmarks in Seconds",
    description:
      "Batch processing handles hundreds of bookmarks efficiently, showing results as they stream in.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data never leaves your browser except for the Anthropic API call. No database, no storage, no tracking.",
  },
  {
    icon: Tags,
    title: "Smart Auto-Tagging",
    description:
      "Each bookmark gets 2-3 relevant tags like #MachineLearning, #WebDev, or #Startup for easy discovery.",
  },
  {
    icon: Search,
    title: "Full-Text Search",
    description:
      "Instantly search across all bookmarks by category, tags, summary, or tweet ID.",
  },
  {
    icon: FileDown,
    title: "Export to JSON / CSV",
    description:
      "Download your categorized bookmarks as structured JSON or CSV files for use anywhere.",
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
    <section className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Everything You <span className="gradient-text">Need</span>
          </h2>
          <p className="mt-4 text-text-muted text-lg max-w-xl mx-auto">
            Powerful features wrapped in a simple, beautiful interface.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="group p-6 rounded-2xl bg-surface/50 border border-border hover:border-accent/20 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display text-lg font-semibold text-text-primary mb-2">
                {f.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
