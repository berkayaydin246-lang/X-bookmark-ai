import { RawBookmark } from "./types";

export function parseBookmarksFile(content: string): RawBookmark[] {
  let parsed: unknown[];

  // Try parsing as plain JSON first (auto-detect)
  try {
    const directParse = JSON.parse(content.trim());
    if (Array.isArray(directParse)) {
      parsed = directParse;
    } else {
      throw new Error("Not an array");
    }
  } catch {
    // Fall back to JS format: window.YTD.bookmarks.part0 = [...]
    const jsonMatch = content.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/);

    if (!jsonMatch) {
      throw new Error(
        "Unrecognized format. Upload a bookmarks.js file from your X data export, or a JSON array of bookmarks."
      );
    }

    try {
      parsed = JSON.parse(jsonMatch[1]);
    } catch {
      throw new Error(
        "Failed to parse bookmarks data. The file may be corrupted."
      );
    }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("No bookmarks found in the file.");
  }

  const bookmarks: RawBookmark[] = [];

  for (const item of parsed) {
    const bookmark = extractBookmark(item);
    if (bookmark) {
      bookmarks.push(bookmark);
    }
  }

  if (bookmarks.length === 0) {
    throw new Error("No valid tweet IDs found in the bookmarks file.");
  }

  return bookmarks;
}

function extractBookmark(item: unknown): RawBookmark | null {
  if (!item || typeof item !== "object") return null;

  const obj = item as Record<string, unknown>;
  let tweetId: string | null = null;
  let text: string | undefined;
  let user: string | undefined;
  let url: string | undefined;

  // Extract text/user/url if available (JSON format)
  if (typeof obj.text === "string") text = obj.text;
  if (typeof obj.user === "string") user = obj.user;
  if (typeof obj.url === "string") url = obj.url;

  // Try direct tweetId field
  if (obj.tweetId && typeof obj.tweetId === "string") {
    tweetId = obj.tweetId;
  }

  // Try nested bookmark.tweetId
  if (!tweetId && obj.bookmark && typeof obj.bookmark === "object") {
    const bookmark = obj.bookmark as Record<string, unknown>;
    if (bookmark.tweetId && typeof bookmark.tweetId === "string") {
      tweetId = bookmark.tweetId;
    }
  }

  // Try tweet.id pattern
  if (!tweetId && obj.tweet && typeof obj.tweet === "object") {
    const tweet = obj.tweet as Record<string, unknown>;
    if (tweet.id && typeof tweet.id === "string") {
      tweetId = tweet.id;
    } else if (tweet.id_str && typeof tweet.id_str === "string") {
      tweetId = tweet.id_str;
    }
    // Also extract text from nested tweet
    if (!text && typeof tweet.full_text === "string") text = tweet.full_text;
    if (!text && typeof tweet.text === "string") text = tweet.text;
  }

  if (!tweetId) return null;

  return { tweetId, text, user, url };
}

export function buildTweetUrl(tweetId: string): string {
  return `https://twitter.com/i/web/status/${tweetId}`;
}
