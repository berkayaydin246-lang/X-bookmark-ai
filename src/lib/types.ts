export interface RawBookmark {
  tweetId: string;
  text?: string;
  user?: string;
  url?: string;
}

export interface CategorizedBookmark {
  tweetId: string;
  url: string;
  category: string;
  summary: string;
  tags: string[];
  confidence: "high" | "medium" | "low";
}

export interface BatchResult {
  results: CategorizedBookmark[];
  error?: string;
}

export type ProcessingStatus =
  | "idle"
  | "uploading"
  | "parsing"
  | "processing"
  | "complete"
  | "error";

export interface ProcessingProgress {
  currentBatch: number;
  totalBatches: number;
  processedCount: number;
  totalCount: number;
}

export interface CategoryCount {
  name: string;
  count: number;
  color: string;
}

export type SortOption = "category" | "confidence" | "default";

export type ExportFormat = "json" | "csv";

export type Language = "tr" | "en" | "de" | "fr" | "es" | "pt" | "ja" | "ko" | "zh" | "ar";

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
  { value: "ar", label: "العربية" },
];
