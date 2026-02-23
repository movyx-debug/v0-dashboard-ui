"use client";

import { X, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterSearch from "@/components/filter-search";
import type { BenchmarkRow } from "@/lib/benchmark-data";

interface FilterBarProps {
  activeParameter: string | null;
  activeDrg: string | null;
  activeFach: string | null;
  onClearParameter: () => void;
  onClearDrg: () => void;
  onClearFach: () => void;
  onClearAll: () => void;
  data: BenchmarkRow[];
  onSelectParam: (v: string) => void;
  onSelectDrg: (v: string) => void;
  onSelectFach: (v: string) => void;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  parameter: {
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-600",
    dot: "bg-blue-500",
  },
  drg: {
    bg: "bg-amber-500/10 border-amber-500/20",
    text: "text-amber-600",
    dot: "bg-amber-500",
  },
  fachabteilung: {
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-600",
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
  data,
  onSelectParam,
  onSelectDrg,
  onSelectFach,
}: FilterBarProps) {
  const hasFilters = !!(activeParameter || activeDrg || activeFach);

  const filters: { type: string; value: string; onClear: () => void }[] = [];
  if (activeParameter)
    filters.push({ type: "parameter", value: activeParameter, onClear: onClearParameter });
  if (activeDrg)
    filters.push({ type: "drg", value: activeDrg, onClear: onClearDrg });
  if (activeFach)
    filters.push({ type: "fachabteilung", value: activeFach, onClear: onClearFach });

  return (
    <div className="h-9 flex items-center gap-2.5">
      {hasFilters ? (
        <>
          <div className="flex items-center gap-1.5 text-muted-foreground flex-shrink-0">
            <Filter className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            {filters.map((f) => {
              const style = TYPE_STYLES[f.type];
              return (
                <span
                  key={f.type}
                  className={`inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md border text-[11px] font-medium ${style.bg} ${style.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot} flex-shrink-0`} />
                  <span className="text-muted-foreground font-normal text-[10px]">
                    {TYPE_LABELS[f.type]}:
                  </span>
                  <span className="max-w-[180px] truncate">{f.value}</span>
                  <button
                    type="button"
                    onClick={f.onClear}
                    className="ml-0.5 p-0.5 rounded hover:bg-foreground/10 cursor-pointer transition-colors"
                    aria-label={`Filter entfernen: ${f.value}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              );
            })}
            {filters.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-[10px] h-6 px-1.5 text-muted-foreground hover:text-foreground"
              >
                Alle entfernen
              </Button>
            )}
          </div>
          <div className="ml-auto flex-shrink-0">
            <FilterSearch
              data={data}
              onSelectParam={onSelectParam}
              onSelectDrg={onSelectDrg}
              onSelectFach={onSelectFach}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2.5 flex-1">
          <div className="flex items-center gap-1.5 text-muted-foreground/50">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="text-[11px]">
              Klicken Sie auf eine Zeile oder suchen Sie
            </span>
          </div>
          <div className="ml-auto flex-shrink-0">
            <FilterSearch
              data={data}
              onSelectParam={onSelectParam}
              onSelectDrg={onSelectDrg}
              onSelectFach={onSelectFach}
            />
          </div>
        </div>
      )}
    </div>
  );
}
