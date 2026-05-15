"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, ExternalLink, Settings2 } from "lucide-react";
import ModelSelector from "@/components/dashboard/ModelSelector";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { ApiKeys, SupportedModelId } from "@/lib/types";
import { useBookmarkStore } from "@/store/useBookmarkStore";

const SETTINGS_STORAGE_KEY = "x-bookmark-ai-settings-v1";

export default function ApiKeyModal() {
  const selectedModel = useBookmarkStore((state) => state.selectedModel);
  const apiKeys = useBookmarkStore((state) => state.apiKeys);
  const ollamaModel = useBookmarkStore((state) => state.ollamaModel);
  const hydrateSettings = useBookmarkStore((state) => state.hydrateSettings);

  const [draftSelectedModel, setDraftSelectedModel] =
    useState<SupportedModelId>(selectedModel);
  const [draftApiKeys, setDraftApiKeys] = useState<ApiKeys>(apiKeys);
  const [draftOllamaModel, setDraftOllamaModel] = useState(ollamaModel);
  const [error, setError] = useState("");

  const handleApiKeyChange = (provider: keyof ApiKeys, key: string) => {
    setDraftApiKeys((current) => ({
      ...current,
      [provider]: key,
    }));
    setError("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validateSelection(
      draftSelectedModel,
      draftApiKeys,
      draftOllamaModel
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    const nextSettings = {
      selectedModel: draftSelectedModel,
      apiKeys: draftApiKeys,
      ollamaModel: draftOllamaModel.trim(),
    };

    hydrateSettings(nextSettings);
    sessionStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-3xl"
      >
        <div className="soft-shadow rounded-[28px] border border-border bg-card p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-badge">
                <Settings2 className="h-7 w-7 text-text-muted" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-text-primary">
                  Choose Your Model
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  Pick a provider, add its API key if needed, and we&apos;ll keep
                  the settings in this session.
                </p>
              </div>
            </div>

            <ThemeToggle />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <ModelSelector
              selectedModel={draftSelectedModel}
              apiKeys={draftApiKeys}
              ollamaModel={draftOllamaModel}
              onSelectedModelChange={(model) => {
                setDraftSelectedModel(model);
                setError("");
              }}
              onApiKeyChange={handleApiKeyChange}
              onOllamaModelChange={(model) => {
                setDraftOllamaModel(model);
                setError("");
              }}
            />

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-badge px-3 py-2 text-sm text-text-secondary">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-text-muted" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={getProviderSetupLink(draftSelectedModel)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-link transition-colors hover:text-text-primary"
              >
                Open provider setup guide
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <Button type="submit" className="sm:min-w-40">
                Continue
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function validateSelection(
  selectedModel: SupportedModelId,
  apiKeys: ApiKeys,
  ollamaModel: string
): string | null {
  if (selectedModel === "ollama") {
    return ollamaModel.trim()
      ? null
      : "Please enter the Ollama model name you want to use.";
  }

  if (selectedModel === "anthropic-haiku") {
    const key = apiKeys.anthropic.trim();
    if (!key) return "Please enter your Anthropic API key.";
    if (!key.startsWith("sk-ant-")) {
      return "Anthropic API keys should start with 'sk-ant-'.";
    }
    return null;
  }

  if (selectedModel === "groq-llama") {
    const key = apiKeys.groq.trim();
    if (!key) return "Please enter your Groq API key.";
    return null;
  }

  if (!apiKeys.gemini.trim()) {
    return "Please enter your Gemini API key.";
  }

  return null;
}

function getProviderSetupLink(selectedModel: SupportedModelId): string {
  if (selectedModel === "anthropic-haiku") {
    return "https://console.anthropic.com/settings/keys";
  }

  if (selectedModel === "groq-llama") {
    return "https://console.groq.com/keys";
  }

  if (selectedModel === "gemini-flash") {
    return "https://aistudio.google.com/app/apikey";
  }

  return "https://ollama.com/download";
}
