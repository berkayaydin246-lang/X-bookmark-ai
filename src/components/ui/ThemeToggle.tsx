"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarkStore } from "@/store/useBookmarkStore";

export default function ThemeToggle() {
  const theme = useBookmarkStore((state) => state.theme);
  const toggleTheme = useBookmarkStore((state) => state.toggleTheme);

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="h-10 w-10"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
