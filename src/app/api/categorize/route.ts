import { NextRequest, NextResponse } from "next/server";
import {
  buildBatchUserPrompt,
  buildCategorizedResults,
  CATEGORIZATION_SYSTEM_PROMPT,
  parseJsonArrayResponse,
} from "@/lib/ai";
import { Language } from "@/lib/types";

type HostedProvider = "anthropic" | "groq" | "gemini";

type RequestBody = {
  items?: Array<{ tweetId: string; url: string; text?: string; user?: string }>;
  provider?: HostedProvider;
  model?: string | null;
  apiKey?: string;
  language?: Language;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const items = body.items;
    const provider = body.provider;
    const model = body.model;
    const apiKey = body.apiKey?.trim();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No bookmarks provided." },
        { status: 400 }
      );
    }

    if (!provider || !["anthropic", "groq", "gemini"].includes(provider)) {
      return NextResponse.json(
        { error: "Unsupported hosted provider." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required for the selected provider." },
        { status: 400 }
      );
    }

    if (provider === "anthropic" && !apiKey.startsWith("sk-ant-")) {
      return NextResponse.json(
        { error: "Invalid Anthropic API key format." },
        { status: 400 }
      );
    }

    const userPrompt = buildBatchUserPrompt(items);
    const systemPrompt = CATEGORIZATION_SYSTEM_PROMPT.startsWith(
      "Respond only in Turkish."
    )
      ? CATEGORIZATION_SYSTEM_PROMPT
      : `Respond only in Turkish.\n${CATEGORIZATION_SYSTEM_PROMPT}`;

    const content = await requestProviderResponse({
      provider,
      apiKey,
      model,
      systemPrompt,
      userPrompt,
    });

    const parsedResults = parseJsonArrayResponse(content);
    const results = buildCategorizedResults(parsedResults, items);

    return NextResponse.json({ results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status = getErrorStatus(error);
    return NextResponse.json({ error: message }, { status });
  }
}

async function requestProviderResponse({
  provider,
  apiKey,
  model,
  systemPrompt,
  userPrompt,
}: {
  provider: HostedProvider;
  apiKey: string;
  model?: string | null;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  if (provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-3-5-haiku-latest",
        max_tokens: 1800,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw await buildProviderError(response);
    }

    const data = (await response.json()) as {
      content?: Array<{ text?: string }>;
    };

    const text = data.content?.[0]?.text;
    if (!text) {
      throw withStatus("Empty response from Anthropic.", 502);
    }

    return text;
  }

  if (provider === "groq") {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "llama-3.1-70b-versatile",
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw await buildProviderError(response);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw withStatus("Empty response from Groq.", 502);
    }

    return text;
  }

  const geminiModel = model || "gemini-2.0-flash";
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  const response = await fetch(geminiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    throw await buildProviderError(response);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("");

  if (!text) {
    throw withStatus("Empty response from Gemini.", 502);
  }

  return text;
}

async function buildProviderError(response: Response): Promise<Error> {
  const fallbackMessage = `Provider request failed with status ${response.status}.`;
  const rawBody = await response.text().catch(() => "");

  if (rawBody) {
    try {
      const data = JSON.parse(rawBody) as {
        error?: { message?: string } | string;
      };

      if (typeof data.error === "string") {
        return withStatus(data.error, response.status);
      }

      if (data.error?.message) {
        return withStatus(data.error.message, response.status);
      }
    } catch {
      return withStatus(rawBody, response.status);
    }
  }

  return withStatus(fallbackMessage, response.status);
}

function withStatus(message: string, status: number): Error {
  const error = new Error(message);
  (error as Error & { status?: number }).status = status;
  return error;
}

function getErrorStatus(error: unknown): number {
  if (error instanceof Error) {
    const status = (error as Error & { status?: number }).status;
    if (typeof status === "number") return status;
  }

  return 500;
}
