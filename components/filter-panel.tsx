"use client";

import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveFilter {
  type: "parameter" | "drg" | "fachabteilung";
  label: string;
  value: string;
}

interface FilterBarProps {
  activeParameter: string | null;
  activeDrg: string | null;
  activeFach: string | null;
  onClearParameter: () => void;
  onClearDrg: () => void;
  onClearFach: () => void;
  onClearAll: () => void;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  parameter: {
    bg: "bg-blue-500/10 border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  drg: {
    bg: "bg-amber-500/10 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  fachabteilung: {
    bg: "bg-emerald-500/10 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
};

const TYPE_LABELS: Record<string, string> = {
  parameter: "Parameter",
  drg: "DRG",
  fachabteilung: "Fachabteilung",
};

export default function FilterBar({
  activeParameter,
  activeDrg,
  activeFach,
  onClearParameter,
  onClearDrg,
  onClearFach,
  onClearAll,
}: FilterBarProps) {
  const filters: ActiveFilter[] = [];
  if (activeParameter)
    filters.push({ type: "parameter", label: "Parameter", value: activeParameter });
  if (activeDrg)
    filters.push({ type: "drg", label: "DRG", value: activeDrg });
  if (activeFach)
    filters.push({ type: "fachabteilung", label: "Fachabteilung", value: activeFach });

  if (filters.length === 0) return null;

  const onClearMap: Record<string, () => void> = {
    parameter: onClearParameter,
    drg: onClearDrg,
    fachabteilung: onClearFach,
  };

  return (
    <div className="flex items-center gap-3 bg-card border rounded-xl px-4 py-2.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-muted-foreground flex-shrink-0">
        <Filter className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Filter</span>
      </div>

      <div className="h-5 w-px bg-border" />

      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => {
          const style = TYPE_STYLES[f.type];
          return (
            <span
              key={f.type}
              className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg border text-xs font-medium ${style.bg} ${style.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              <span className="text-muted-foreground font-normal">
                {TYPE_LABELS[f.type]}:
              </span>
              <span className="max-w-[200px] truncate">{f.value}</span>
              <button
                type="button"
                onClick={onClearMap[f.type]}
                className="ml-0.5 p-0.5 rounded hover:bg-foreground/10 cursor-pointer transition-colors"
                aria-label={`Filter entfernen: ${f.value}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
      </div>

      {filters.length > 1 && (
        <>
          <div className="h-5 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            Alle entfernen
          </Button>
        </>
      )}
    </div>
  );
}
