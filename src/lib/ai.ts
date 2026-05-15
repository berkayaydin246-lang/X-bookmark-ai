import {
  ApiKeys,
  CategorizedBookmark,
  MODEL_OPTIONS,
  ModelOption,
  SupportedModelId,
} from "./types";
import { buildTweetUrl } from "./parser";

export const BOOKMARK_CATEGORIES = [
  "AI & Machine Learning",
  "Web Development",
  "Design",
  "Finance",
  "Science",
  "Education",
  "Career",
  "Health",
  "Entertainment",
  "Business",
  "Politics",
  "Other",
] as const;

type BookmarkCategory = (typeof BOOKMARK_CATEGORIES)[number];

const TURKISH_CATEGORY_TRANSLATIONS: Record<BookmarkCategory, string> = {
  "AI & Machine Learning": "Yapay Zeka & Makine Öğrenimi",
  "Web Development": "Web Geliştirme",
  Design: "Tasarım",
  Finance: "Finans",
  Science: "Bilim",
  Education: "Eğitim",
  Career: "Kariyer",
  Health: "Sağlık",
  Entertainment: "Eğlence",
  Business: "İş Dünyası",
  Politics: "Politika",
  Other: "Diğer",
};

const CATEGORY_NORMALIZATION: Record<string, BookmarkCategory> = {
  ai: "AI & Machine Learning",
  "ai and machine learning": "AI & Machine Learning",
  "machine learning": "AI & Machine Learning",
  "artificial intelligence": "AI & Machine Learning",
  programming: "Web Development",
  coding: "Web Development",
  development: "Web Development",
  technology: "Web Development",
  tech: "Web Development",
  engineering: "Web Development",
  "web development": "Web Development",
  "finance & investing": "Finance",
  investing: "Finance",
  finance: "Finance",
  startup: "Business",
  entrepreneurship: "Business",
  business: "Business",
  jobs: "Career",
  career: "Career",
  recruiting: "Career",
  hiring: "Career",
  politics: "Politics",
  government: "Politics",
  policy: "Politics",
  "yapay zeka & makine öğrenimi": "AI & Machine Learning",
  "yapay zeka ve makine öğrenimi": "AI & Machine Learning",
  "web geliştirme": "Web Development",
  tasarım: "Design",
  eğitim: "Education",
  kariyer: "Career",
  "finans & yatırım": "Finance",
  finans: "Finance",
  bilim: "Science",
  "iş dünyası": "Business",
  sağlık: "Health",
  eğlence: "Entertainment",
  politika: "Politics",
  diğer: "Other",
};

const NORMALIZED_CATEGORY_LOOKUP = Object.entries(CATEGORY_NORMALIZATION).reduce<
  Record<string, BookmarkCategory>
>((lookup, [key, value]) => {
  lookup[normalizeCategoryKey(key)] = value;
  return lookup;
}, {});

const POLITICAL_SIGNALS = [
  "election",
  "policy",
  "government",
  "president",
  "minister",
  "parliament",
  "congress",
  "senate",
  "campaign",
  "law",
  "vote",
  "seçim",
  "hükümet",
  "bakan",
  "parlamento",
  "meclis",
  "oy",
  "yasa",
  "politika",
];

type BatchPromptItem = {
  tweetId: string;
  user?: string;
  text?: string;
  url?: string;
};

export const CATEGORIZATION_SYSTEM_PROMPT = `Respond only in Turkish.
You are an expert content analyst specializing in categorizing social media bookmarks.

CRITICAL LANGUAGE RULE:
You MUST write ALL fields in TURKISH. No exceptions.
- category → Turkish (Yapay Zeka & Makine Öğrenimi, Web Geliştirme, Tasarım, Eğitim, Kariyer, Finans, Bilim, İş Dünyası, Sağlık, Eğlence, Politika, Diğer)
- summary → Turkish
- tags → Turkish

Even if the tweet is written in English, your response MUST be in Turkish.
Translate and summarize in Turkish. Never write English words in summary or tags.

BAD: "The GitHub repository provides a CUDA programming course."
GOOD: "Bu GitHub deposu, GPU optimizasyonu için CUDA programlama kursu sunuyor. GPU ile yüksek performanslı hesaplama öğrenmek isteyenler için kapsamlı bir kaynak."

BAD category: "AI & Machine Learning"
GOOD category: "Yapay Zeka & Makine Öğrenimi"

## CATEGORY RULES
Use ONLY these categories:
Yapay Zeka & Makine Öğrenimi | Web Geliştirme | Tasarım | Eğitim | Kariyer |
Finans | Bilim | İş Dünyası | Sağlık | Eğlence | Politika | Diğer

## SUMMARY RULES (Critical)
Write a summary of 2 sentences minimum. Follow this formula:
- Sentence 1: What is the main topic or tool being discussed? Be specific.
- Sentence 2: Why does it matter or what can the reader gain from it?

BAD summary examples (never do these):
- "A or B?" ← meaningless, no context
- "Python ekosistemi." ← too vague
- "Google Stitch, UI tasarımı oluşturur." ← just repeats the obvious

GOOD summary examples:
- Turkish: "Anthropic'in ücretsiz olarak yayınladığı Prompt Mühendisliği kursu, başlangıçtan ileri seviyeye kadar gerçek sektör örnekleriyle prompt yazmayı öğretiyor. Claude gibi büyük dil modellerini daha verimli kullanmak isteyenler için kapsamlı bir kaynak."

## TAG RULES
- 2 to 4 tags per bookmark
- Tags must be in Turkish
- Tags should be specific, not generic (avoid #technology, #internet, #post)
- Good Turkish tags: #açıkKaynak #makineÖğrenimi #ücretsizKurs

## OUTPUT FORMAT
Return ONLY a valid JSON array. No markdown. No explanation. No extra text.
Each object must have exactly these fields:
{
  "tweetId": "string",
  "category": "string (in Turkish)",
  "summary": "string (2+ sentences, specific and informative, in Turkish)",
  "tags": ["string", "string", "string"] (in Turkish),
  "confidence": "high" | "medium" | "low"
}`;

export function getModelOption(selectedModel: SupportedModelId): ModelOption {
  return (
    MODEL_OPTIONS.find((option) => option.id === selectedModel) ?? MODEL_OPTIONS[0]
  );
}

export function getActiveApiKey(
  selectedModel: SupportedModelId,
  apiKeys: ApiKeys
): string {
  const option = getModelOption(selectedModel);

  if (option.provider === "anthropic") return apiKeys.anthropic.trim();
  if (option.provider === "groq") return apiKeys.groq.trim();
  if (option.provider === "gemini") return apiKeys.gemini.trim();

  return "";
}

export function isModelConfigured(
  selectedModel: SupportedModelId,
  apiKeys: ApiKeys,
  ollamaModel: string
): boolean {
  const option = getModelOption(selectedModel);

  if (!option.requiresApiKey) {
    return ollamaModel.trim().length > 0;
  }

  return getActiveApiKey(selectedModel, apiKeys).length > 0;
}

export function getConfiguredModelName(
  selectedModel: SupportedModelId,
  ollamaModel: string
): string {
  const option = getModelOption(selectedModel);
  if (option.provider === "ollama") {
    return ollamaModel.trim() || "ollama";
  }
  return option.displayModel;
}

export function estimateModelCost(
  bookmarkCount: number,
  selectedModel: SupportedModelId
): { amount: number; label: string } {
  const option = getModelOption(selectedModel);

  if (option.costPer100Bookmarks === 0 || bookmarkCount === 0) {
    return { amount: 0, label: option.costLabel };
  }

  const rawAmount = (bookmarkCount / 100) * option.costPer100Bookmarks;
  const amount = Number(rawAmount.toFixed(2));

  return {
    amount,
    label: `~$${amount.toFixed(2)}`,
  };
}

export function buildBatchUserPrompt(items: BatchPromptItem[]): string {
  const tweets = items
    .map(
      (item, index) => `TWEET ${index + 1}:
ID: ${item.tweetId}
Author: ${normalizePromptField(item.user)}
Text: ${normalizePromptField(item.text)}
---`
    )
    .join("\n");

  return `Analyze and categorize the following ${items.length} tweets. 
Write every output field in Turkish for every tweet.

${tweets}

Return a JSON array with ${items.length} objects, one per tweet, in the same order.`;
}

export function parseJsonArrayResponse(content: string): unknown[] {
  const trimmed = content.trim();

  let jsonText = trimmed;
  if (jsonText.startsWith("```")) {
    jsonText = jsonText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "");
  }

  const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    jsonText = arrayMatch[0];
  }

  const parsed = JSON.parse(jsonText);

  if (!Array.isArray(parsed)) {
    throw new Error("Model response was not a JSON array.");
  }

  return parsed;
}

export function buildCategorizedResults(
  rawResults: unknown[],
  items: BatchPromptItem[]
): CategorizedBookmark[] {
  const itemsById = new Map(items.map((item) => [item.tweetId, item]));
  const resultsById = new Map<string, CategorizedBookmark>();

  rawResults.forEach((rawResult, index) => {
    if (!rawResult || typeof rawResult !== "object") return;

    const record = rawResult as Record<string, unknown>;
    const candidateTweetId =
      typeof record.tweetId === "string" ? record.tweetId : null;

    const sourceItem =
      (candidateTweetId && itemsById.get(candidateTweetId)) || items[index];

    if (!sourceItem) return;

    let canonicalCategory = normalizeCategory(
      typeof record.category === "string" ? record.category : undefined
    );

    if (
      canonicalCategory === "Politics" &&
      sourceItem.text &&
      !hasPoliticalSignal(sourceItem.text)
    ) {
      canonicalCategory = "Other";
    }

    const localizedCategory = localizeCategory(canonicalCategory);

    const summary =
      typeof record.summary === "string" && record.summary.trim().length > 0
        ? record.summary.trim().replace(/\s+/g, " ").slice(0, 280)
        : fallbackSummary(canonicalCategory);

    resultsById.set(sourceItem.tweetId, {
      tweetId: sourceItem.tweetId,
      url: sourceItem.url || buildTweetUrl(sourceItem.tweetId),
      category: localizedCategory,
      summary,
      tags: sanitizeTags(record.tags),
      confidence: inferConfidence(
        sourceItem.text,
        canonicalCategory,
        record.confidence
      ),
    });
  });

  return items.map((item) => {
    const existing = resultsById.get(item.tweetId);
    if (existing) return existing;

    return {
      tweetId: item.tweetId,
      url: item.url || buildTweetUrl(item.tweetId),
      category: localizeCategory("Other"),
      summary: fallbackSummary("Other"),
      tags: [],
      confidence: item.text ? "low" : "medium",
    };
  });
}

export function normalizeCategory(input: string | undefined): BookmarkCategory {
  if (!input) return "Other";

  const trimmed = input.trim();
  const direct = BOOKMARK_CATEGORIES.find(
    (category) => normalizeCategoryKey(category) === normalizeCategoryKey(trimmed)
  );

  if (direct) return direct;

  return NORMALIZED_CATEGORY_LOOKUP[normalizeCategoryKey(trimmed)] || "Other";
}

export function fallbackSummary(
  category: BookmarkCategory
): string {
  return `Bu yer imi, eldeki bağlama göre büyük olasılıkla ${localizeCategory(
    category
  ).toLowerCase()} kategorisinde yer alıyor. Daha net sınıflandırma için ek bağlam gerekebilir.`;
}

export function localizeCategory(category: BookmarkCategory): string {
  return TURKISH_CATEGORY_TRANSLATIONS[category];
}

function normalizeTweetText(text?: string): string {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim().slice(0, 500);
}

function normalizePromptField(value?: string): string {
  return normalizeTweetText(value);
}

function normalizeCategoryKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ß/g, "ss")
    .trim();
}

function hasPoliticalSignal(text: string): boolean {
  const lowerText = text.toLowerCase();
  return POLITICAL_SIGNALS.some((signal) => lowerText.includes(signal));
}

function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];

  return tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.replace(/^#/, "").trim())
    .filter((tag) => tag.length >= 2 && tag.length <= 24)
    .slice(0, 4);
}

function inferConfidence(
  text: string | undefined,
  category: string,
  rawConfidence: unknown
): "high" | "medium" | "low" {
  if (
    rawConfidence === "high" ||
    rawConfidence === "medium" ||
    rawConfidence === "low"
  ) {
    return rawConfidence;
  }

  if (!text || text.trim().length < 20) return "low";
  if (category === "Other") return "low";
  if (text.length > 140) return "high";

  return "medium";
}
