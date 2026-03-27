"use client";

import { Globe } from "lucide-react";
import { useBookmarkStore } from "@/store/useBookmarkStore";
import { LANGUAGES, Language } from "@/lib/types";

export default function LanguageSelector() {
  const { language, setLanguage } = useBookmarkStore();

  return (
    <div className="flex items-center gap-3">
      <Globe className="w-4 h-4 text-text-muted" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
