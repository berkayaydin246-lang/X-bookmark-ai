import {
  RawBookmark,
  CategorizedBookmark,
  BatchResult,
  ProcessingProgress,
  Language,
} from "./types";
import { buildTweetUrl } from "./parser";

const BATCH_SIZE = 25;
const CACHE_KEY_PREFIX = "x-bookmark-ai-cache-v2";

type LocalRule = {
  category: string;
  keywords: string[];
  tags: {
    en: string[];
    tr: string[];
  };
};

const LOCAL_RULES: LocalRule[] = [
  {
    category: "AI & Machine Learning",
    keywords: [
      "ai",
      "llm",
      "gpt",
      "claude",
      "anthropic",
      "openai",
      "machine learning",
      "deep learning",
      "neural",
      "prompt",
    ],
    tags: {
      en: ["AI", "LLM", "MachineLearning"],
      tr: ["yapay-zeka", "llm", "makine-ogrenimi"],
    },
  },
  {
    category: "Programming",
    keywords: [
      "python",
      "javascript",
      "typescript",
      "rust",
      "go",
      "java",
      "repo",
      "github",
      "code",
      "coding",
      "algorithm",
      "api",
    ],
    tags: {
      en: ["Programming", "Code", "Dev"],
      tr: ["programlama", "kod", "yazilim"],
    },
  },
  {
    category: "Web Development",
    keywords: [
      "next.js",
      "react",
      "frontend",
      "backend",
      "css",
      "tailwind",
      "node",
      "web app",
      "html",
    ],
    tags: {
      en: ["WebDev", "Frontend", "Backend"],
      tr: ["web-gelistirme", "frontend", "backend"],
    },
  },
  {
    category: "Design",
    keywords: [
      "design",
      "ux",
      "ui",
      "figma",
      "typography",
      "branding",
      "layout",
      "visual",
    ],
    tags: {
      en: ["Design", "UX", "UI"],
      tr: ["tasarim", "ux", "ui"],
    },
  },
  {
    category: "Finance & Investing",
    keywords: [
      "stock",
      "invest",
      "market",
      "portfolio",
      "etf",
      "finance",
      "economy",
      "trading",
      "earnings",
    ],
    tags: {
      en: ["Finance", "Investing", "Markets"],
      tr: ["finans", "yatirim", "piyasalar"],
    },
  },
  {
    category: "Crypto",
    keywords: [
      "bitcoin",
      "btc",
      "ethereum",
      "eth",
      "crypto",
      "blockchain",
      "defi",
      "token",
      "web3",
    ],
    tags: {
      en: ["Crypto", "Blockchain", "Web3"],
      tr: ["kripto", "blockchain", "web3"],
    },
  },
  {
    category: "Business",
    keywords: [
      "startup",
      "saas",
      "founder",
      "growth",
      "product",
      "strategy",
      "b2b",
      "revenue",
      "sales",
    ],
    tags: {
      en: ["Business", "Startup", "Strategy"],
      tr: ["is", "girisim", "strateji"],
    },
  },
  {
    category: "Politics",
    keywords: [
      "election",
      "senate",
      "parliament",
      "minister",
      "president",
      "policy",
      "government",
      "law",
      "campaign",
      "congress",
    ],
    tags: {
      en: ["Politics", "Policy", "Government"],
      tr: ["siyaset", "politika", "hukumet"],
    },
  },
  {
    category: "Health",
    keywords: [
      "health",
      "medical",
      "doctor",
      "disease",
      "fitness",
      "nutrition",
      "mental health",
    ],
    tags: {
      en: ["Health", "Wellness", "Medicine"],
      tr: ["saglik", "wellness", "tip"],
    },
  },
  {
    category: "Science",
    keywords: [
      "science",
      "research",
      "paper",
      "physics",
      "biology",
      "chemistry",
      "study",
      "experiment",
    ],
    tags: {
      en: ["Science", "Research", "Study"],
      tr: ["bilim", "arastirma", "calisma"],
    },
  },
];

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cacheKeyForLanguage(language: Language): string {
  return `${CACHE_KEY_PREFIX}-${language}`;
}

function loadCache(language: Language): Record<string, CategorizedBookmark> {
  if (typeof window === "undefined") return {};

  try {
    const raw = sessionStorage.getItem(cacheKeyForLanguage(language));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CategorizedBookmark>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveCache(
  language: Language,
  cache: Record<string, CategorizedBookmark>
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(cacheKeyForLanguage(language), JSON.stringify(cache));
  } catch {
    // Ignore storage errors (quota/private mode), app can still proceed.
  }
}

function buildLocalSummary(category: string, language: Language): string {
  if (language === "tr") {
    return `Bu içerik, yer imi metnine göre büyük olasılıkla ${category.toLowerCase()} kategorisiyle ilgili.`;
  }

  return `Likely related to ${category.toLowerCase()} based on the bookmark text.`;
}

function localTagsForLanguage(rule: LocalRule, language: Language): string[] {
  if (language === "tr") {
    return rule.tags.tr;
  }
  return rule.tags.en;
}

function tryLocalCategorization(
  bookmark: RawBookmark,
  language: Language
): CategorizedBookmark | null {
  if (!bookmark.text) return null;

  const text = bookmark.text.toLowerCase();
  let bestRule: LocalRule | null = null;
  let bestScore = 0;
  let secondBest = 0;

  for (const rule of LOCAL_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) score += 1;
    }

    if (score > bestScore) {
      secondBest = bestScore;
      bestScore = score;
      bestRule = rule;
    } else if (score > secondBest) {
      secondBest = score;
    }
  }

  // Require stronger signal to avoid overconfident wrong local classifications.
  if (!bestRule || bestScore < 2 || bestScore - secondBest < 1) {
    return null;
  }

  return {
    tweetId: bookmark.tweetId,
    url: bookmark.url || buildTweetUrl(bookmark.tweetId),
    category: bestRule.category,
    summary: buildLocalSummary(bestRule.category, language),
    tags: localTagsForLanguage(bestRule, language),
    confidence: bestScore >= 4 ? "high" : "medium",
  };
}

export async function processBatches(
  rawBookmarks: RawBookmark[],
  apiKey: string,
  language: Language,
  onBatchComplete: (results: CategorizedBookmark[]) => void,
  onProgress: (progress: ProcessingProgress) => void,
  onError: (error: string, batchIndex: number) => void
): Promise<CategorizedBookmark[]> {
  const uniqueBookmarks = Array.from(
    new Map(rawBookmarks.map((b) => [b.tweetId, b])).values()
  );
  const duplicateCount = rawBookmarks.length - uniqueBookmarks.length;

  const cache = loadCache(language);
  const cachedResults: CategorizedBookmark[] = [];
  const localResults: CategorizedBookmark[] = [];
  const toProcess: RawBookmark[] = [];

  for (const bookmark of uniqueBookmarks) {
    const cached = cache[bookmark.tweetId];
    if (cached) {
      cachedResults.push(cached);
      continue;
    }

    const local = tryLocalCategorization(bookmark, language);
    if (local) {
      localResults.push(local);
      cache[bookmark.tweetId] = local;
      continue;
    }

    toProcess.push(bookmark);
  }

  const batches = chunk(toProcess, BATCH_SIZE);
  const allResults: CategorizedBookmark[] = [];
  let processedCount = duplicateCount;

  if (cachedResults.length > 0) {
    allResults.push(...cachedResults);
    processedCount += cachedResults.length;
    onBatchComplete(cachedResults);
  }

  if (localResults.length > 0) {
    allResults.push(...localResults);
    processedCount += localResults.length;
    onBatchComplete(localResults);
  }

  onProgress({
    currentBatch: batches.length > 0 ? 1 : 0,
    totalBatches: batches.length,
    processedCount,
    totalCount: rawBookmarks.length,
  });

  for (let i = 0; i < batches.length; i++) {
    onProgress({
      currentBatch: i + 1,
      totalBatches: batches.length,
      processedCount,
      totalCount: rawBookmarks.length,
    });

    const items = batches[i].map((b) => ({
      tweetId: b.tweetId,
      url: b.url || buildTweetUrl(b.tweetId),
      text: b.text,
      user: b.user,
    }));

    let retries = 0;
    const maxRetries = 3;
    let success = false;

    while (retries < maxRetries && !success) {
      try {
        const response = await fetch("/api/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            apiKey,
            language,
          }),
        });

        if (response.status === 429) {
          const waitTime = Math.pow(2, retries) * 2000;
          await sleep(waitTime);
          retries++;
          continue;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `API request failed with status ${response.status}`
          );
        }

        const data: BatchResult = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        allResults.push(...data.results);
        for (const result of data.results) {
          cache[result.tweetId] = result;
        }
        processedCount += batches[i].length;
        onBatchComplete(data.results);
        success = true;
      } catch (error) {
        retries++;
        if (retries >= maxRetries) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          onError(`Batch ${i + 1} failed: ${message}`, i);
          processedCount += batches[i].length;
        } else {
          await sleep(Math.pow(2, retries) * 1000);
        }
      }
    }

    if (i < batches.length - 1) {
      await sleep(500);
    }
  }

  saveCache(language, cache);

  return allResults;
}
