"use client";

import { useMemo } from "react";
import { Calculator, Database, PlayCircle, X } from "lucide-react";
import { getModelOption } from "@/lib/ai";
import { getProcessingEstimate } from "@/lib/categorizer";
import { RawBookmark, SupportedModelId } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface Props {
  rawBookmarks: RawBookmark[];
  selectedModel: SupportedModelId;
  isProcessing: boolean;
  onStart: () => void;
  onUseCachedOnly: () => void;
  onClearCache: () => void;
}

export default function CostEstimator({
  rawBookmarks,
  selectedModel,
  isProcessing,
  onStart,
  onUseCachedOnly,
  onClearCache,
}: Props) {
  const estimate = useMemo(
    () => getProcessingEstimate(rawBookmarks, selectedModel),
    [rawBookmarks, selectedModel]
  );

  const selectedOption = useMemo(
    () => getModelOption(selectedModel),
    [selectedModel]
  );

  if (estimate.totalBookmarks === 0) return null;

  return (
    <div className="soft-shadow mx-auto mt-8 w-full max-w-2xl rounded-3xl border border-border bg-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-badge">
          <Calculator className="h-5 w-5 text-text-muted" />
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-text-primary">
            Cost Estimate
          </h3>
          <p className="text-sm text-text-secondary">
            {selectedOption.label} · {selectedOption.displayModel}
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 text-sm">
        <EstimateRow label="Bookmarks found" value={estimate.totalBookmarks} />
        <div className="flex items-start justify-between gap-6 border-b border-border pb-3">
          <div className="space-y-1">
            <p className="text-text-secondary">
              {`💾 Cached: ${estimate.cachedCount} bookmarks`}
            </p>
            <p className="text-xs text-text-muted">
              {`(click 'Clear Cache' to re-process all)`}
            </p>
          </div>
          {estimate.cachedCount > 0 ? (
            <button
              type="button"
              onClick={onClearCache}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-card hover:text-text-primary"
              aria-label="Clear cache"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span className="font-medium text-text-primary">0</span>
          )}
        </div>
        <EstimateRow label="To process" value={estimate.toProcessCount} />
        <EstimateRow
          label="Estimated API calls"
          value={`${estimate.estimatedApiCalls} (25 per batch)`}
        />
        <EstimateRow
          label="Estimated cost"
          value={`${estimate.estimatedCostLabel} (with ${selectedOption.label})`}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          onClick={onStart}
          disabled={isProcessing || estimate.totalBookmarks === 0}
          className="flex-1 text-base font-semibold"
        >
          <PlayCircle className="mr-2 h-5 w-5" />
          Start Categorizing
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={onUseCachedOnly}
          disabled={isProcessing || estimate.cachedCount === 0}
          className="flex-1 text-base font-semibold"
        >
          <Database className="mr-2 h-5 w-5" />
          Use Cached Only
        </Button>
      </div>
    </div>
  );
}

function EstimateRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}
