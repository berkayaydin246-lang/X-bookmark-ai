"use client";

import { Globe } from "lucide-react";
import { LANGUAGES, Language } from "@/lib/types";
import { useBookmarkStore } from "@/store/useBookmarkStore";

export default function LanguageSelector() {
  const { language, setLanguage } = useBookmarkStore();

  return (
    <div className="flex items-center gap-3">
      <Globe className="h-4 w-4 text-text-muted" />
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="h-10 cursor-pointer rounded-xl border border-border bg-card px-3 text-sm text-text-primary focus:border-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)]"
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
