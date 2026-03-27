"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Key, ExternalLink, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBookmarkStore } from "@/store/useBookmarkStore";

export default function ApiKeyModal() {
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");
  const setApiKey = useBookmarkStore((s) => s.setApiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = key.trim();

    if (!trimmed) {
      setError("Please enter your API key.");
      return;
    }

    if (!trimmed.startsWith("sk-ant-")) {
      setError("Invalid key format. Anthropic API keys start with 'sk-ant-'.");
      return;
    }

    sessionStorage.setItem("anthropic-key", trimmed);
    setApiKey(trimmed);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="p-8 rounded-2xl bg-surface border border-border">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
            <Key className="w-7 h-7 text-accent" />
          </div>

          <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
            Enter Your API Key
          </h2>
          <p className="text-text-muted text-sm leading-relaxed mb-6">
            Your API key is only used to call Anthropic&apos;s API directly from
            this app. We never store it on any server.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="sk-ant-api03-..."
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError("");
                }}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent-light transition-colors"
            >
              Get an API key from Anthropic
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
