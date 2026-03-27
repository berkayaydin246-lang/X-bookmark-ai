import { CategorizedBookmark, ExportFormat } from "./types";

export function exportBookmarks(
  bookmarks: CategorizedBookmark[],
  format: ExportFormat
): void {
  if (format === "json") {
    exportJSON(bookmarks);
  } else {
    exportCSV(bookmarks);
  }
}

function exportJSON(bookmarks: CategorizedBookmark[]): void {
  const data = JSON.stringify(bookmarks, null, 2);
  downloadFile(data, "bookmarks-categorized.json", "application/json");
}

function exportCSV(bookmarks: CategorizedBookmark[]): void {
  const headers = ["tweetId", "URL", "Category", "Summary", "Tags", "Confidence"];
  const rows = bookmarks.map((b) => [
    b.tweetId,
    b.url,
    `"${b.category}"`,
    `"${b.summary.replace(/"/g, '""')}"`,
    `"${b.tags.join(", ")}"`,
    b.confidence,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadFile(csv, "bookmarks-categorized.csv", "text/csv");
}

function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
