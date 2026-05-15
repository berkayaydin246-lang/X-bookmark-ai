import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        surface: "var(--bg-surface)",
        card: "var(--bg-card)",
        border: "var(--border-default)",
        badge: "var(--badge-bg)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "tag-bg": "var(--tag-bg)",
        "tag-text": "var(--tag-text)",
        cta: "var(--cta-bg)",
        "cta-text": "var(--cta-text)",
        link: "var(--link-color)",
      },
      fontFamily: {
        sans: ["Google Sans", "sans-serif"],
        display: ["Google Sans Display", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        shimmer: "shimmer 2s infinite linear",
        pulse: "pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
