"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-border bg-card px-3 py-2 font-sans text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 focus:border-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
