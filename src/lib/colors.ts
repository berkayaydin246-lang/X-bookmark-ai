const CATEGORY_COLORS: Record<string, string> = {
  "AI & Machine Learning": "#00D4AA",
  "Web Development": "#3B82F6",
  Design: "#F472B6",
  "Finance & Investing": "#FBBF24",
  Science: "#A78BFA",
  Politics: "#EF4444",
  Health: "#34D399",
  Education: "#60A5FA",
  Entertainment: "#FB923C",
  Business: "#2DD4BF",
  Technology: "#818CF8",
  Sports: "#F87171",
  Music: "#E879F9",
  Food: "#FCD34D",
  Travel: "#4ADE80",
  Gaming: "#C084FC",
  Crypto: "#F59E0B",
  News: "#94A3B8",
  Programming: "#06B6D4",
  Art: "#EC4899",
  Other: "#6E6E8A",
};

const FALLBACK_COLORS = [
  "#00D4AA",
  "#3B82F6",
  "#F472B6",
  "#FBBF24",
  "#A78BFA",
  "#34D399",
  "#60A5FA",
  "#FB923C",
  "#818CF8",
  "#E879F9",
];

export function getCategoryColor(category: string): string {
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }

  // Deterministic color based on category name
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

export function getCategoryBgClass(category: string): string {
  const color = getCategoryColor(category);
  return `bg-[${color}]/15 text-[${color}] border-[${color}]/30`;
}
