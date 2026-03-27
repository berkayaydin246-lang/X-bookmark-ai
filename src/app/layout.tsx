import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${dmSans.variable} font-body antialiased`}
      >
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#12121A",
              border: "1px solid #1E1E2E",
              color: "#F0F0F5",
            },
          }}
        />
      </body>
    </html>
  );
}
