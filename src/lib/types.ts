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

export type AIProvider = "anthropic" | "groq" | "gemini" | "ollama";

export type SupportedModelId =
  | "anthropic-haiku"
  | "groq-llama"
  | "gemini-flash"
  | "ollama";

export interface ApiKeys {
  anthropic: string;
  groq: string;
  gemini: string;
}

export interface ModelOption {
  id: SupportedModelId;
  provider: AIProvider;
  label: string;
  providerLabel: string;
  description: string;
  displayModel: string;
  apiModel: string | null;
  baseUrl: string;
  requiresApiKey: boolean;
  costPer100Bookmarks: number;
  costLabel: string;
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

export interface ProcessingEstimate {
  totalBookmarks: number;
  cachedCount: number;
  toProcessCount: number;
  estimatedApiCalls: number;
  estimatedCost: number;
  estimatedCostLabel: string;
}

export interface CategoryCount {
  name: string;
  count: number;
  color: string;
}

export type SortOption = "category" | "confidence" | "default";

export type ExportFormat = "json" | "csv";

export type Language = "tr" | "en" | "de" | "fr" | "es" | "pt" | "ja" | "ko" | "zh" | "ar";

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "anthropic-haiku",
    provider: "anthropic",
    label: "Claude",
    providerLabel: "Anthropic",
    description: "Cheapest Claude option for hosted runs.",
    displayModel: "claude-haiku-3-5",
    apiModel: "claude-3-5-haiku-latest",
    baseUrl: "https://api.anthropic.com",
    requiresApiKey: true,
    costPer100Bookmarks: 0.02,
    costLabel: "~$0.02",
  },
  {
    id: "groq-llama",
    provider: "groq",
    label: "Groq",
    providerLabel: "Groq",
    description: "Fast hosted inference with Llama 3.1 70B Versatile.",
    displayModel: "llama-3.1-70b-versatile",
    apiModel: "llama-3.1-70b-versatile",
    baseUrl: "https://api.groq.com/openai/v1",
    requiresApiKey: true,
    costPer100Bookmarks: 0,
    costLabel: "Free",
  },
  {
    id: "gemini-flash",
    provider: "gemini",
    label: "Gemini",
    providerLabel: "Google",
    description: "Very cheap hosted option with Gemini Flash.",
    displayModel: "gemini-2.0-flash",
    apiModel: "gemini-2.0-flash",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    requiresApiKey: true,
    costPer100Bookmarks: 0.01,
    costLabel: "~$0.01",
  },
  {
    id: "ollama",
    provider: "ollama",
    label: "Ollama",
    providerLabel: "Local",
    description: "Runs on your machine with a local model.",
    displayModel: "Custom local model",
    apiModel: null,
    baseUrl: "http://localhost:11434/api",
    requiresApiKey: false,
    costPer100Bookmarks: 0,
    costLabel: "Free (local)",
  },
];

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
