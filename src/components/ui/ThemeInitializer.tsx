"use client";

import { useEffect } from "react";
import { useBookmarkStore } from "@/store/useBookmarkStore";

export default function ThemeInitializer() {
  const initializeTheme = useBookmarkStore((state) => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return null;
}
