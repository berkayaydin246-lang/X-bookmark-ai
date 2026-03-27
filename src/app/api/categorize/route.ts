import { NextRequest, NextResponse } from "next/server";

const ALLOWED_CATEGORIES = [
  "AI & Machine Learning",
  "Web Development",
  "Programming",
  "Design",
  "Finance & Investing",
  "Crypto",
  "Business",
  "Science",
  "Health",
  "Education",
  "Politics",
  "Technology",
  "News",
  "Entertainment",
  "Sports",
  "Other",
] as const;

const CATEGORY_NORMALIZATION: Record<string, (typeof ALLOWED_CATEGORIES)[number]> = {
  ai: "AI & Machine Learning",
  "ai and machine learning": "AI & Machine Learning",
  "machine learning": "AI & Machine Learning",
  "software engineering": "Programming",
  coding: "Programming",
  development: "Programming",
  "web dev": "Web Development",
  web: "Web Development",
  ux: "Design",
  ui: "Design",
  finance: "Finance & Investing",
  investing: "Finance & Investing",
  entrepreneurship: "Business",
  startup: "Business",
  tech: "Technology",
  world: "News",
};

function normalizeCategory(input: string | undefined): (typeof ALLOWED_CATEGORIES)[number] {
  if (!input) return "Other";

  const trimmed = input.trim();
  const direct = ALLOWED_CATEGORIES.find(
    (cat) => cat.toLowerCase() === trimmed.toLowerCase()
  );
  if (direct) return direct;

  const normalized = CATEGORY_NORMALIZATION[trimmed.toLowerCase()];
  return normalized || "Other";
}

function hasPoliticalSignal(text: string): boolean {
  const t = text.toLowerCase();
  const signals = [
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
  ];

  return signals.some((signal) => t.includes(signal));
}

function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];

  return tags
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.replace(/^#/, "").trim())
    .filter((t) => t.length >= 2 && t.length <= 24)
    .slice(0, 3);
}

function fallbackSummary(category: string, language: string): string {
  if (language === "tr") {
    return `Bu içerik, mevcut yer imi bağlamına göre büyük olasılıkla ${category.toLowerCase()} kategorisiyle ilgili.`;
  }

  return `Likely related to ${category.toLowerCase()} based on available bookmark context.`;
}

function buildSystemPrompt(language: string): string {
  const langInstruction =
    language === "en"
      ? "Write all summaries and tags in English."
      : `Write all summaries and tags strictly in the language with code "${language}". Do not mix English unless unavoidable proper nouns, product names, or programming keywords. Category names should stay in English.`;

  return `You are a strict bookmark categorization AI for X/Twitter bookmarks.

You receive a list of bookmarks with tweet ID, URL, and sometimes tweet text.
If text exists, prioritize text heavily over generic URL guessing.

Use ONLY these category names exactly:
${ALLOWED_CATEGORIES.join(", ")}

Rules:
1) Pick exactly one category per bookmark.
2) Choose "Politics" ONLY when there is explicit political context (election, government, policy, campaign, parliament, congress, etc.).
3) If uncertain, choose "Other" instead of forcing a wrong specific category.
4) Do not invent facts that are not implied by provided text.

For each bookmark, return a JSON object:
{
  "tweetId": "string",
  "category": "string (must be one value from the allowed category list)",
  "summary": "string (1-2 sentences describing what this bookmark is about — be specific and informative)",
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": "high | medium | low"
}

${langInstruction}

Return ONLY a valid JSON array. No explanation, no markdown, no extra text.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, apiKey, language } = body;

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!apiKey.startsWith("sk-ant-")) {
      return NextResponse.json(
        { error: "Invalid API key format. Key should start with 'sk-ant-'" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No bookmarks provided" },
        { status: 400 }
      );
    }

    // Build the user message with tweet text when available
    const bookmarkLines = items.map(
      (
        item: { tweetId: string; url: string; text?: string; user?: string },
        i: number
      ) => {
        let line = `${i + 1}. Tweet ID: ${item.tweetId}\n   URL: ${item.url}`;
        if (item.text) {
          line += `\n   Content: ${item.text.slice(0, 300)}`;
        }
        if (item.user) {
          line += `\n   User: ${item.user.split("\n")[0]}`;
        }
        return line;
      }
    );

    const userMessage = `Categorize these ${items.length} X/Twitter bookmarks:\n\n${bookmarkLines.join("\n\n")}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2400,
        temperature: 0.2,
        system: buildSystemPrompt(language || "en"),
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    if (response.status === 401) {
      return NextResponse.json(
        {
          error:
            "Invalid API key. Please check your Anthropic API key and try again.",
        },
        { status: 401 }
      );
    }

    if (response.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait and try again." },
        { status: 429 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Anthropic API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 500 }
      );
    }

    // Parse the JSON response - handle potential markdown wrapping
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let results;
    try {
      results = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON" },
        { status: 500 }
      );
    }

    if (!Array.isArray(results)) {
      return NextResponse.json(
        { error: "AI response is not an array" },
        { status: 500 }
      );
    }

    const enrichedResults = results.map(
      (r: {
        tweetId: string;
        category?: string;
        summary?: string;
        tags?: string[];
        confidence?: string;
      }) => ({
        tweetId: r.tweetId,
        url: `https://twitter.com/i/web/status/${r.tweetId}`,
        category: normalizeCategory(r.category),
        summary:
          typeof r.summary === "string" && r.summary.trim().length > 0
            ? r.summary.trim().slice(0, 280)
            : fallbackSummary(normalizeCategory(r.category), language || "en"),
        tags: sanitizeTags(r.tags),
        confidence: ["high", "medium", "low"].includes(r.confidence || "")
          ? r.confidence
          : "medium",
      })
    );

    // Safety net: downgrade politics if source text has no political signal.
    const itemTextById = new Map<string, string>();
    for (const item of items as Array<{ tweetId: string; text?: string }>) {
      if (item.text) itemTextById.set(item.tweetId, item.text);
    }

    const guardedResults = enrichedResults.map((result) => {
      if (result.category !== "Politics") return result;
      const text = itemTextById.get(result.tweetId);
      if (!text || !hasPoliticalSignal(text)) {
        return {
          ...result,
          category: "Other",
          confidence: result.confidence === "high" ? "medium" : "low",
        };
      }
      return result;
    });

    return NextResponse.json({ results: guardedResults });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
