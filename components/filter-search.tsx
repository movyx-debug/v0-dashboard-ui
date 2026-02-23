"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, TestTube, Building2, Stethoscope } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { BenchmarkRow } from "@/lib/benchmark-data";

interface FilterSearchProps {
  data: BenchmarkRow[];
  onSelectParam: (v: string) => void;
  onSelectDrg: (v: string) => void;
  onSelectFach: (v: string) => void;
}

interface SearchResults {
  parameters: string[];
  drgs: string[];
  fachabteilungen: string[];
}

export default function FilterSearch({
  data,
  onSelectParam,
  onSelectDrg,
  onSelectFach,
}: FilterSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce 400ms
  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery("");
      setOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      const q = query.trim();
      setDebouncedQuery(q);
      if (q.length > 0) setOpen(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Compute matching values
  const results: SearchResults = (() => {
    if (!debouncedQuery) return { parameters: [], drgs: [], fachabteilungen: [] };
    const q = debouncedQuery.toLowerCase();
    const allParams = [...new Set(data.map((r) => r.parameter_name))];
    const allDrgs = [...new Set(data.map((r) => r.drg))];
    const allFachs = [...new Set(data.map((r) => r.fachabteilung))];
    return {
      parameters: allParams.filter((v) => v.toLowerCase().includes(q)),
      drgs: allDrgs.filter((v) => v.toLowerCase().includes(q)),
      fachabteilungen: allFachs.filter((v) => v.toLowerCase().includes(q)),
    };
  })();

  const totalResults = results.parameters.length + results.drgs.length + results.fachabteilungen.length;

  const handleSelect = useCallback(
    (type: "param" | "drg" | "fach", value: string) => {
      if (type === "param") onSelectParam(value);
      else if (type === "drg") onSelectDrg(value);
      else onSelectFach(value);
      setQuery("");
      setDebouncedQuery("");
      setOpen(false);
    },
    [onSelectParam, onSelectDrg, onSelectFach],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Parameter, DRG oder Abteilung suchen..."
            className="h-8 w-[260px] rounded-md border bg-background pl-7 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[600px] p-0"
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {totalResults === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            Keine Ergebnisse fur{" "}
            <span className="font-medium text-foreground">
              {`"${debouncedQuery}"`}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-3 divide-x max-h-[320px]">
            {/* Parameter column */}
            <div className="min-h-0">
              <div className="sticky top-0 bg-muted/50 px-3 py-2 border-b flex items-center gap-1.5">
                <TestTube className="h-3 w-3 text-blue-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Parameter
                </span>
                {results.parameters.length > 0 && (
                  <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
                    {results.parameters.length}
                  </span>
                )}
              </div>
              <div className="overflow-y-auto max-h-[276px]">
                {results.parameters.length === 0 ? (
                  <p className="p-3 text-[11px] text-muted-foreground/50 italic">
                    Keine Treffer
                  </p>
                ) : (
                  results.parameters.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSelect("param", p)}
                      className="w-full text-left px-3 py-2 text-[11px] text-foreground hover:bg-blue-500/10 transition-colors cursor-pointer border-b border-border/30 last:border-0"
                    >
                      <HighlightMatch text={p} query={debouncedQuery} />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* DRG column */}
            <div className="min-h-0">
              <div className="sticky top-0 bg-muted/50 px-3 py-2 border-b flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  DRG
                </span>
                {results.drgs.length > 0 && (
                  <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
                    {results.drgs.length}
                  </span>
                )}
              </div>
              <div className="overflow-y-auto max-h-[276px]">
                {results.drgs.length === 0 ? (
                  <p className="p-3 text-[11px] text-muted-foreground/50 italic">
                    Keine Treffer
                  </p>
                ) : (
                  results.drgs.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleSelect("drg", d)}
                      className="w-full text-left px-3 py-2 text-[11px] text-foreground hover:bg-amber-500/10 transition-colors cursor-pointer border-b border-border/30 last:border-0"
                    >
                      <HighlightMatch text={d} query={debouncedQuery} />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Fachabteilung column */}
            <div className="min-h-0">
              <div className="sticky top-0 bg-muted/50 px-3 py-2 border-b flex items-center gap-1.5">
                <Stethoscope className="h-3 w-3 text-emerald-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Fachabteilung
                </span>
                {results.fachabteilungen.length > 0 && (
                  <span className="ml-auto text-[10px] tabular-nums text-muted-foreground">
                    {results.fachabteilungen.length}
                  </span>
                )}
              </div>
              <div className="overflow-y-auto max-h-[276px]">
                {results.fachabteilungen.length === 0 ? (
                  <p className="p-3 text-[11px] text-muted-foreground/50 italic">
                    Keine Treffer
                  </p>
                ) : (
                  results.fachabteilungen.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => handleSelect("fach", f)}
                      className="w-full text-left px-3 py-2 text-[11px] text-foreground hover:bg-emerald-500/10 transition-colors cursor-pointer border-b border-border/30 last:border-0"
                    >
                      <HighlightMatch text={f} query={debouncedQuery} />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Highlights the matching substring in bold */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold text-foreground bg-primary/10 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </span>
      {text.slice(idx + query.length)}
    </>
  );
}
