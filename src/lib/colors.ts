export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Yapay Zeka & Makine Öğrenimi": { bg: "#1a1a4e", text: "#818cf8" },
  "Web Geliştirme": { bg: "#0f2d1f", text: "#34d399" },
  Tasarım: { bg: "#2d1a3d", text: "#c084fc" },
  Eğitim: { bg: "#1a2d0f", text: "#86efac" },
  Kariyer: { bg: "#1a2a3d", text: "#60a5fa" },
  Finans: { bg: "#2d2a0f", text: "#fbbf24" },
  Bilim: { bg: "#0f2a2d", text: "#22d3ee" },
  "İş Dünyası": { bg: "#2d1a1a", text: "#f87171" },
  Sağlık: { bg: "#0f2d1a", text: "#4ade80" },
  Eğlence: { bg: "#2d1a2a", text: "#f472b6" },
  Politika: { bg: "#2d200f", text: "#fb923c" },
  Diğer: { bg: "#1e1e1e", text: "#9ca3af" },
  "AI & Machine Learning": { bg: "#1a1a4e", text: "#818cf8" },
  "Web Development": { bg: "#0f2d1f", text: "#34d399" },
  Design: { bg: "#2d1a3d", text: "#c084fc" },
  Education: { bg: "#1a2d0f", text: "#86efac" },
  Career: { bg: "#1a2a3d", text: "#60a5fa" },
  Finance: { bg: "#2d2a0f", text: "#fbbf24" },
  Science: { bg: "#0f2a2d", text: "#22d3ee" },
  Business: { bg: "#2d1a1a", text: "#f87171" },
  Health: { bg: "#0f2d1a", text: "#4ade80" },
  Entertainment: { bg: "#2d1a2a", text: "#f472b6" },
  Politics: { bg: "#2d200f", text: "#fb923c" },
  Other: { bg: "#1e1e1e", text: "#9ca3af" },
};

export const DEFAULT_COLOR = { bg: "#1e1e2e", text: "#a78bfa" };

export function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? DEFAULT_COLOR;
}

export function getCategoryBadgeStyle(
  category: string,
  theme: "light" | "dark"
) {
  const color = getCategoryColor(category);

  return {
    backgroundColor:
      theme === "light" ? withOpacity(color.bg, 0.9) : color.bg,
    color: color.text,
  };
}

function withOpacity(hex: string, opacity: number): string {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalized;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}
