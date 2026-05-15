"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Server } from "lucide-react";
import { getModelOption } from "@/lib/ai";
import {
  ApiKeys,
  MODEL_OPTIONS,
  SupportedModelId,
} from "@/lib/types";
import { Input } from "@/components/ui/input";

interface Props {
  selectedModel: SupportedModelId;
  apiKeys: ApiKeys;
  ollamaModel: string;
  onSelectedModelChange: (model: SupportedModelId) => void;
  onApiKeyChange: (provider: keyof ApiKeys, key: string) => void;
  onOllamaModelChange: (model: string) => void;
}

export default function ModelSelector({
  selectedModel,
  apiKeys,
  ollamaModel,
  onSelectedModelChange,
  onApiKeyChange,
  onOllamaModelChange,
}: Props) {
  const [showSecret, setShowSecret] = useState(false);

  const selectedOption = useMemo(
    () => getModelOption(selectedModel),
    [selectedModel]
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3">
        {MODEL_OPTIONS.map((option) => {
          const isSelected = option.id === selectedModel;

          return (
            <motion.button
              key={option.id}
              type="button"
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectedModelChange(option.id)}
              className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? "border-[var(--text-muted)] bg-badge"
                  : "border-border bg-card hover:border-[var(--text-muted)] hover:bg-surface"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-semibold text-text-primary">
                      {option.label}
                    </span>
                    <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-text-muted">
                      {option.providerLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-secondary">
                    {option.displayModel}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {option.description}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <span className="rounded-full bg-tag-bg px-2.5 py-1 text-xs font-medium text-tag-text">
                    {option.costLabel} / 100 bookmarks
                  </span>
                  <span className="text-xs text-text-muted">
                    {option.baseUrl}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        {selectedOption.provider === "ollama" ? (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <Server className="h-4 w-4 text-text-muted" />
              Ollama model name
            </label>
            <Input
              value={ollamaModel}
              onChange={(event) => onOllamaModelChange(event.target.value)}
              placeholder="llama3"
            />
            <p className="text-sm leading-relaxed text-text-secondary">
              Using Ollama keeps the flow local and private as long as the
              service is running on your machine.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <KeyRound className="h-4 w-4 text-text-muted" />
              {selectedOption.label} API key
            </label>
            <div className="relative">
              <Input
                type={showSecret ? "text" : "password"}
                value={getApiKeyValue(selectedOption.id, apiKeys)}
                onChange={(event) =>
                  onApiKeyChange(
                    getApiKeyProvider(selectedOption.id),
                    event.target.value
                  )
                }
                placeholder={getApiKeyPlaceholder(selectedOption.id)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-text-muted">
              Base URL:{" "}
              <span className="text-text-primary">{selectedOption.baseUrl}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function getApiKeyProvider(selectedModel: SupportedModelId): keyof ApiKeys {
  if (selectedModel === "anthropic-haiku") return "anthropic";
  if (selectedModel === "groq-llama") return "groq";
  return "gemini";
}

function getApiKeyValue(
  selectedModel: SupportedModelId,
  apiKeys: ApiKeys
): string {
  if (selectedModel === "anthropic-haiku") return apiKeys.anthropic;
  if (selectedModel === "groq-llama") return apiKeys.groq;
  return apiKeys.gemini;
}

function getApiKeyPlaceholder(selectedModel: SupportedModelId): string {
  if (selectedModel === "anthropic-haiku") return "sk-ant-...";
  if (selectedModel === "groq-llama") return "gsk_...";
  return "AIza...";
}
