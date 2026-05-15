import {
  buildBatchUserPrompt,
  buildCategorizedResults,
  CATEGORIZATION_SYSTEM_PROMPT,
  estimateModelCost,
  getModelOption,
  parseJsonArrayResponse,
} from "./ai";
import { buildTweetUrl } from "./parser";
import {
  BatchResult,
  CategorizedBookmark,
  Language,
  ProcessingEstimate,
  ProcessingProgress,
  RawBookmark,
  SupportedModelId,
} from "./types";

const BATCH_SIZE = 25;
const CACHE_KEY = "bookmark_cache_v1";
const LEGACY_CACHE_KEYS = ["bookmark_cache_v2", "bookmark_cache_v3"] as const;
const DEFAULT_DELAY_MS = 300;
const RATE_LIMIT_WAIT_MS = 5000;
const MAX_RETRIES = 3;

export const CATEGORY_NORMALIZE: Record<string, string> = {
  "AI & Machine Learning": "Yapay Zeka & Makine Öğrenimi",
  "Web Development": "Web Geliştirme",
  Design: "Tasarım",
  Education: "Eğitim",
  Career: "Kariyer",
  Finance: "Finans",
  Science: "Bilim",
  Business: "İş Dünyası",
  Health: "Sağlık",
  Entertainment: "Eğlence",
  Politics: "Politika",
  Other: "Diğer",
  "Finans & Yatırım": "Finans",
  "Yapay Zeka ve Makine Öğrenimi": "Yapay Zeka & Makine Öğrenimi",
};

type ProcessBatchesOptions = {
  rawBookmarks: RawBookmark[];
  selectedModel: SupportedModelId;
  apiKey?: string;
  ollamaModel?: string;
  language: Language;
  onBatchComplete: (results: CategorizedBookmark[]) => void;
  onProgress: (progress: ProcessingProgress) => void;
  onError: (error: string, batchIndex: number) => void;
  onStatusMessage?: (message: string | null) => void;
};

export type ProcessBatchesResult = {
  results: CategorizedBookmark[];
  cachedCount: number;
  toProcessCount: number;
  failedBatches: number;
};

export function normalizeCategory(category: string): string {
  return CATEGORY_NORMALIZE[category] ?? category;
}

export function normalizeCategorizedBookmark(
  bookmark: CategorizedBookmark
): CategorizedBookmark {
  return {
    ...bookmark,
    url: bookmark.url || buildTweetUrl(bookmark.tweetId),
    category: normalizeCategory(bookmark.category),
    summary: bookmark.summary.trim(),
    tags: Array.isArray(bookmark.tags)
      ? bookmark.tags
          .filter((tag): tag is string => typeof tag === "string")
          .map((tag) => tag.replace(/^#/, "").trim())
          .filter(Boolean)
          .slice(0, 4)
      : [],
    confidence:
      bookmark.confidence === "high" ||
      bookmark.confidence === "medium" ||
      bookmark.confidence === "low"
        ? bookmark.confidence
        : "medium",
  };
}

export function clearBookmarkCache(): void {
  if (typeof window === "undefined") return;

  [CACHE_KEY, ...LEGACY_CACHE_KEYS].forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function getProcessingEstimate(
  rawBookmarks: RawBookmark[],
  selectedModel: SupportedModelId
): ProcessingEstimate {
  const uniqueBookmarks = dedupeBookmarks(rawBookmarks);
  const cachedCount = uniqueBookmarks.filter((bookmark) =>
    Boolean(getCached(bookmark.tweetId))
  ).length;
  const toProcessCount = uniqueBookmarks.length - cachedCount;
  const estimatedApiCalls = Math.ceil(toProcessCount / BATCH_SIZE);
  const estimatedCost = estimateModelCost(toProcessCount, selectedModel);

  return {
    totalBookmarks: uniqueBookmarks.length,
    cachedCount,
    toProcessCount,
    estimatedApiCalls,
    estimatedCost: estimatedCost.amount,
    estimatedCostLabel: estimatedCost.label,
  };
}

export function getCachedBookmarks(
  rawBookmarks: RawBookmark[]
): CategorizedBookmark[] {
  const uniqueBookmarks = dedupeBookmarks(rawBookmarks);

  return uniqueBookmarks
    .map((bookmark) => getCached(bookmark.tweetId))
    .filter((bookmark): bookmark is CategorizedBookmark => Boolean(bookmark));
}

export async function processBatches({
  rawBookmarks,
  selectedModel,
  apiKey,
  ollamaModel,
  language,
  onBatchComplete,
  onProgress,
  onError,
  onStatusMessage,
}: ProcessBatchesOptions): Promise<ProcessBatchesResult> {
  const option = getModelOption(selectedModel);

  if (option.requiresApiKey && !apiKey?.trim()) {
    throw new Error(`${option.label} API key is required.`);
  }

  if (option.provider === "ollama" && !ollamaModel?.trim()) {
    throw new Error("Please enter an Ollama model name.");
  }

  const uniqueBookmarks = dedupeBookmarks(rawBookmarks);
  const cachedResults = getCachedBookmarks(uniqueBookmarks);
  const cachedIds = new Set(cachedResults.map((bookmark) => bookmark.tweetId));
  const toProcess = uniqueBookmarks.filter(
    (bookmark) => !cachedIds.has(bookmark.tweetId)
  );

  const batches = chunk(toProcess, BATCH_SIZE);
  const allResults = [...cachedResults];
  let processedCount = cachedResults.length;
  let failedBatches = 0;

  if (cachedResults.length > 0) {
    onBatchComplete(cachedResults);
  }

  onStatusMessage?.(
    `${cachedResults.length} from cache, ${toProcess.length} new to process.`
  );
  onProgress({
    currentBatch: batches.length > 0 ? 1 : 0,
    totalBatches: batches.length,
    processedCount,
    totalCount: uniqueBookmarks.length,
  });

  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    const items = batch.map((bookmark) => ({
      tweetId: bookmark.tweetId,
      user: bookmark.user,
      url: bookmark.url || buildTweetUrl(bookmark.tweetId),
      text: bookmark.text,
    }));

    onProgress({
      currentBatch: index + 1,
      totalBatches: batches.length,
      processedCount,
      totalCount: uniqueBookmarks.length,
    });

    let completed = false;

    for (let attempt = 0; attempt < MAX_RETRIES && !completed; attempt += 1) {
      try {
        const batchResults =
          option.provider === "ollama"
            ? await requestOllamaBatch(items, ollamaModel!.trim())
            : await requestHostedBatch(
                items,
                selectedModel,
                apiKey!.trim(),
                language
              );

        setCache(batchResults);
        allResults.push(...batchResults);
        processedCount += batchResults.length;
        onBatchComplete(batchResults);
        onProgress({
          currentBatch: index + 1,
          totalBatches: batches.length,
          processedCount,
          totalCount: uniqueBookmarks.length,
        });
        onStatusMessage?.(null);
        completed = true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown processing error";
        const rateLimited = isRateLimitError(error);

        if (rateLimited && attempt < MAX_RETRIES - 1) {
          onStatusMessage?.("Rate limit hit, waiting 5s...");
          await sleep(RATE_LIMIT_WAIT_MS);
          continue;
        }

        if (!rateLimited && attempt < MAX_RETRIES - 1) {
          const retryDelay = Math.pow(2, attempt + 1) * 1000;
          onStatusMessage?.(
            `Retrying batch ${index + 1} in ${retryDelay / 1000}s...`
          );
          await sleep(retryDelay);
          continue;
        }

        failedBatches += 1;
        processedCount += batch.length;
        onError(`Batch ${index + 1} failed: ${message}`, index);
        onProgress({
          currentBatch: index + 1,
          totalBatches: batches.length,
          processedCount,
          totalCount: uniqueBookmarks.length,
        });
      }
    }

    if (index < batches.length - 1) {
      await sleep(DEFAULT_DELAY_MS);
    }
  }

  onStatusMessage?.(
    failedBatches > 0 ? `${failedBatches} batch failed during processing.` : null
  );

  return {
    results: allResults,
    cachedCount: cachedResults.length,
    toProcessCount: toProcess.length,
    failedBatches,
  };
}

function getCached(
  tweetId: string
): CategorizedBookmark | null {
  if (typeof window === "undefined") return null;

  const cache = loadCache();
  return cache[getCacheEntryKey(tweetId)] || null;
}

function setCache(results: CategorizedBookmark[]): void {
  if (typeof window === "undefined") return;

  const cache = loadCache();
  results.forEach((result) => {
    const normalized = normalizeCategorizedBookmark(result);
    cache[getCacheEntryKey(normalized.tweetId)] = normalized;
  });
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

function loadCache(): Record<string, CategorizedBookmark> {
  if (typeof window === "undefined") return {};

  const cache: Record<string, CategorizedBookmark> = {};

  for (const storageKey of [CACHE_KEY, ...LEGACY_CACHE_KEYS]) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) continue;

      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (!parsed || typeof parsed !== "object") continue;

      Object.entries(parsed).forEach(([entryKey, value]) => {
        const normalized = coerceCacheEntry(entryKey, value);
        if (normalized) {
          cache[getCacheEntryKey(normalized.tweetId)] = normalized;
        }
      });
    } catch {
      continue;
    }
  }

  return cache;
}

async function requestHostedBatch(
  items: Array<{ tweetId: string; url: string; text?: string; user?: string }>,
  selectedModel: SupportedModelId,
  apiKey: string,
  language: Language
): Promise<CategorizedBookmark[]> {
  const option = getModelOption(selectedModel);
  const response = await fetch("/api/categorize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items,
      provider: option.provider,
      model: option.apiModel,
      apiKey,
      language,
    }),
  });

  if (response.status === 429) {
    throw createRateLimitError();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `API request failed with status ${response.status}`
    );
  }

  const data = (await response.json()) as BatchResult;

  if (data.error) {
    throw new Error(data.error);
  }

  return data.results.map(normalizeCategorizedBookmark);
}

async function requestOllamaBatch(
  items: Array<{ tweetId: string; url: string; text?: string; user?: string }>,
  ollamaModel: string
): Promise<CategorizedBookmark[]> {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ollamaModel,
      system: CATEGORIZATION_SYSTEM_PROMPT,
      prompt: buildBatchUserPrompt(items),
      options: {
        temperature: 0.3,
      },
      stream: false,
    }),
  });

  if (response.status === 429) {
    throw createRateLimitError();
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Ollama request failed.");
  }

  const data = (await response.json()) as { response?: string };
  if (!data.response) {
    throw new Error("Ollama returned an empty response.");
  }

  const parsedResults = parseJsonArrayResponse(data.response);
  return buildCategorizedResults(parsedResults, items).map(normalizeCategorizedBookmark);
}

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size));
  }
  return chunks;
}

function dedupeBookmarks(rawBookmarks: RawBookmark[]): RawBookmark[] {
  return Array.from(
    new Map(rawBookmarks.map((bookmark) => [bookmark.tweetId, bookmark])).values()
  );
}

function getCacheEntryKey(tweetId: string): string {
  return tweetId;
}

function coerceCacheEntry(
  entryKey: string,
  value: unknown
): CategorizedBookmark | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Partial<CategorizedBookmark>;
  const tweetId =
    typeof record.tweetId === "string" && record.tweetId.trim().length > 0
      ? record.tweetId
      : extractTweetIdFromCacheKey(entryKey);

  if (!tweetId) return null;

  return normalizeCategorizedBookmark({
    tweetId,
    url:
      typeof record.url === "string" && record.url.trim().length > 0
        ? record.url
        : buildTweetUrl(tweetId),
    category:
      typeof record.category === "string" && record.category.trim().length > 0
        ? record.category
        : "Diğer",
    summary:
      typeof record.summary === "string" && record.summary.trim().length > 0
        ? record.summary
        : "Bu yer imi icin onbellekte kullanilabilir bir ozet bulunamadi.",
    tags: Array.isArray(record.tags) ? record.tags : [],
    confidence:
      record.confidence === "high" ||
      record.confidence === "medium" ||
      record.confidence === "low"
        ? record.confidence
        : "medium",
  });
}

function extractTweetIdFromCacheKey(entryKey: string): string {
  const parts = entryKey.split(":");
  return parts[parts.length - 1]?.trim() || "";
}

function createRateLimitError(): Error {
  const error = new Error("Rate limit exceeded.");
  (error as Error & { code?: number }).code = 429;
  return error;
}

function isRateLimitError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.toLowerCase().includes("rate limit") ||
      (error as Error & { code?: number }).code === 429)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
