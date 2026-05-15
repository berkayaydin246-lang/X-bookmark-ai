/* eslint-disable @next/next/no-page-custom-font */

import type { Metadata } from "next";
import { Toaster } from "sonner";
import ThemeInitializer from "@/components/ui/ThemeInitializer";
import "./globals.css";

export const metadata: Metadata = {
  title: "X Bookmark AI — AI-Powered Bookmark Categorizer",
  description:
    "Upload your X (Twitter) bookmarks and let AI automatically categorize, tag, and organize them into a beautiful, searchable dashboard.",
  keywords: [
    "twitter bookmarks",
    "x bookmarks",
    "ai categorizer",
    "bookmark organizer",
    "twitter data export",
  ],
  openGraph: {
    title: "X Bookmark AI — Your Bookmarks, Finally Organized",
    description:
      "AI-powered categorization for your X (Twitter) bookmarks. Upload, categorize, explore.",
    type: "website",
  },
};

const themeScript = `
  (function () {
    try {
      var storedTheme = localStorage.getItem("x-bookmark-ai-theme");
      var theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
      document.documentElement.classList.toggle("dark", theme === "dark");
    } catch (error) {
      document.documentElement.classList.add("dark");
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Display:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background font-sans text-text-primary antialiased">
        <ThemeInitializer />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
            },
          }}
        />
      </body>
    </html>
  );
}
