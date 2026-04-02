"use client";

import React, { useMemo, useState } from "react";
import type { BenchmarkRow } from "@/lib/benchmark-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

/* ── Formatters ─────────────────────────────────────────────── */
const fmtDe = (n: number | null, dec = 2) =>
  n === null
    ? "-"
    : n.toLocaleString("de-DE", {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      });
const fmtInt = (n: number) => Math.round(n).toLocaleString("de-DE");
const fmtEur = (n: number) =>
  `${Math.round(n).toLocaleString("de-DE")} \u20AC`;

/* ── Sub-benchmark meta ──────────────────────────────────────── */
const SUB_COLORS = {
  indikation: { color: "#5b8ab5", label: "Indikation", unit: "%" },
  multiCaseRate: { color: "#d97706", label: "Monitorfallrate", unit: "%" },
  frequenz: { color: "#ca8a04", label: "Frequenz", unit: "Tage" },
  monitorZeit: { color: "#92400e", label: "Monitorzeit", unit: "Tage" },
} as const;

/* ── Hebel colors (matching top-items-table) ────────────────── */
const INDIKATION_COLOR = "#5b8ab5";
const INTENSITAET_COLOR = "#e07a34";

const SUBS_HEBEL = [
  { key: "indikation_pct" as const, color: INDIKATION_COLOR, label: "Indikation", isIntensitaet: false },
  { key: "multiCaseRate_pct" as const, color: "#d97706", label: "Monitorfallrate", isIntensitaet: true },
  { key: "frequenz_pct" as const, color: "#ca8a04", label: "Frequenz", isIntensitaet: true },
  { key: "monitorZeit_pct" as const, color: "#92400e", label: "Monitorzeit", isIntensitaet: true },
];

type SubKey = keyof typeof SUB_COLORS;
const SUB_KEYS: SubKey[] = ["indikation", "multiCaseRate", "frequenz", "monitorZeit"];

/* ── Sorting ─────────────────────────────────────────────────── */
type SortField =
  | "parameter_name"
  | "drg"
  | "fachabteilung"
  | "analysen_pro_fall_kunde"
  | "analysen_pro_fall_benchmark"
  | "hauptpot_net_analysen"
  | "hauptpot_brut_euro"
  | "erlosverlust_euro"
  | "hauptpot_net_euro"
  | "indikation_pct"
  | "multiCaseRate_pct"
  | "frequenz_pct"
  | "monitorZeit_pct";

type SortDir = "asc" | "desc";
const ITEMS_PER_PAGE = 50;

/* ── Props ───────────────────────────────────────────────────── */
interface Props {
  data: BenchmarkRow[];
  onSelectParam: (name: string) => void;
  onSelectDrg: (name: string) => void;
  onSelectFach: (name: string) => void;
}

/* ── Helper: sub-benchmark kunde/benchmark from row ──────── */
function getSubValues(
  row: BenchmarkRow,
  key: SubKey
): { kunde: number | null; benchmark: number } {
  switch (key) {
    case "indikation":
      return { kunde: row.indikationsquote_kunde, benchmark: row.indikationsquote_benchmark };
    case "multiCaseRate":
      return {
        kunde: row.multiCaseRate !== null ? row.multiCaseRate * 100 : null,
        benchmark: row.multiCaseRate_benchmark * 100,
      };
    case "frequenz":
      return { kunde: row.frequenz_tage_kunde, benchmark: row.frequenz_tage_benchmark };
    case "monitorZeit":
      return { kunde: row.span_kunde, benchmark: row.span_benchmark };
  }
}

/* ── Phase colors (matching benchmark-section) ──────────────── */
const PHASE_COLORS = ["#4a7fad", "#5b8ab5", "#8bb0d0"];
const PHASE_RATIOS = [0.42, 0.38, 0.20];
const PHASE_NAMES = ["Aufnahme", "Verlauf", "Entlass"];

/* ── Stacked bar with hover popup (like in top-items-table) ── */
function StackedBar({ row }: { row: BenchmarkRow }) {
  const segments = SUBS_HEBEL.map((s) => ({
    ...s,
    pct: row[s.key] as number,
  })).filter((s) => s.pct > 0);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex h-[8px] w-full min-w-[80px] rounded-full overflow-hidden bg-secondary cursor-default">
          {segments.map((seg) => (
            <div
              key={seg.key}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full border-r border-white/80 last:border-r-0"
              style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
            />
          ))}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-card text-foreground border shadow-lg px-3 py-2.5"
      >
        <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wider">
          Hebelverteilung
        </p>
        <div className="flex flex-col gap-1.5">
          {/* Indikation */}
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: INDIKATION_COLOR }}
            />
            <span className="text-[11px] text-foreground w-[90px]">
              Indikation
            </span>
            <div className="w-16 h-[5px] rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(row.indikation_pct, 100)}%`,
                  backgroundColor: INDIKATION_COLOR,
                  opacity: row.indikation_pct === 0 ? 0.15 : 1,
                }}
              />
            </div>
            <span
              className="text-[11px] font-semibold tabular-nums w-[32px] text-right"
              style={{ color: row.indikation_pct > 0 ? INDIKATION_COLOR : "hsl(var(--muted-foreground))" }}
            >
              {Math.round(row.indikation_pct)}%
            </span>
          </div>
          
          {/* Intensitaet Gesamt */}
          {(() => {
            const intensitaetPct = row.multiCaseRate_pct + row.frequenz_pct + row.monitorZeit_pct;
            return (
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: INTENSITAET_COLOR }}
                />
                <span className="text-[11px] text-foreground w-[90px] font-medium">
                  Intensitat
                </span>
                <div className="w-16 h-[5px] rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(intensitaetPct, 100)}%`,
                      backgroundColor: INTENSITAET_COLOR,
                      opacity: intensitaetPct === 0 ? 0.15 : 1,
                    }}
                  />
                </div>
                <span
                  className="text-[11px] font-semibold tabular-nums w-[32px] text-right"
                  style={{ color: intensitaetPct > 0 ? INTENSITAET_COLOR : "hsl(var(--muted-foreground))" }}
                >
                  {Math.round(intensitaetPct)}%
                </span>
              </div>
            );
          })()}
          
          {/* Sub-Hebel der Intensitaet (eingerueckt) */}
          <div className="ml-3 pl-2 border-l border-border/50 flex flex-col gap-1">
            {SUBS_HEBEL.filter(s => s.isIntensitaet).map((s) => {
              const pct = row[s.key] as number;
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-[10px] text-muted-foreground w-[78px]">
                    {s.label}
                  </span>
                  <div className="w-12 h-[4px] rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: s.color,
                        opacity: pct === 0 ? 0.15 : 1,
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-medium tabular-nums w-[28px] text-right"
                    style={{ color: pct > 0 ? s.color : "hsl(var(--muted-foreground))" }}
                  >
                    {Math.round(pct)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/* ── Combined value cells with single hover trigger (horizontal tooltip) ── */
function ValueCellsGroup({ row }: { row: BenchmarkRow }) {
  // Helper to check if kunde is worse than benchmark
  const isWorse = (subKey: SubKey) => {
    const { kunde, benchmark } = getSubValues(row, subKey);
    return kunde !== null && (
      subKey === "frequenz" || subKey === "monitorZeit" 
        ? kunde < benchmark
        : kunde > benchmark
    );
  };

  // Calculate Intensitaet (sum of 3 sub-hebel)
  const intensitaetPct = row.multiCaseRate_pct + row.frequenz_pct + row.monitorZeit_pct;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="grid grid-cols-4 cursor-default">
          {SUB_KEYS.map((subKey) => {
            const meta = SUB_COLORS[subKey];
            const { kunde, benchmark } = getSubValues(row, subKey);
            const worse = isWorse(subKey);
            return (
              <div key={subKey} className="flex flex-col items-center px-2 py-2 min-w-[75px]">
                <span
                  className="text-[10px] tabular-nums font-semibold"
                  style={{ color: worse ? "hsl(var(--destructive))" : "hsl(var(--foreground))" }}
                >
                  {fmtDe(kunde)} <span className="text-[8px] font-normal text-muted-foreground">{meta.unit}</span>
                </span>
                <span className="text-[9px] tabular-nums text-primary">
                  {fmtDe(benchmark)} <span className="text-[8px] font-normal text-muted-foreground/70">{meta.unit}</span>
                </span>
              </div>
            );
          })}
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        className="bg-card text-foreground border shadow-lg px-3 py-2.5"
      >
        {/* Horizontal layout - all metrics side by side */}
        <div className="flex gap-4">
          {/* Indikation */}
          <div className="flex flex-col items-center min-w-[70px]">
            <div className="flex items-center gap-1 mb-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INDIKATION_COLOR }} />
              <span className="text-[9px] font-semibold" style={{ color: INDIKATION_COLOR }}>Indikation</span>
            </div>
            <span className="text-[10px] tabular-nums font-semibold" style={{ color: isWorse("indikation") ? "hsl(var(--destructive))" : "hsl(var(--foreground))" }}>
              {fmtDe(getSubValues(row, "indikation").kunde)}%
            </span>
            <span className="text-[9px] tabular-nums text-primary">
              {fmtDe(getSubValues(row, "indikation").benchmark)}%
            </span>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-10 h-[4px] rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(row.indikation_pct, 100)}%`, backgroundColor: INDIKATION_COLOR }} />
              </div>
              <span className="text-[8px] font-medium tabular-nums" style={{ color: INDIKATION_COLOR }}>{Math.round(row.indikation_pct)}%</span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-border self-stretch" />

          {/* Intensitaet group */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: INTENSITAET_COLOR }} />
              <span className="text-[9px] font-semibold" style={{ color: INTENSITAET_COLOR }}>Intensitat</span>
              <div className="flex items-center gap-1 ml-2">
                <div className="w-8 h-[4px] rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(intensitaetPct, 100)}%`, backgroundColor: INTENSITAET_COLOR }} />
                </div>
                <span className="text-[8px] font-medium tabular-nums" style={{ color: INTENSITAET_COLOR }}>{Math.round(intensitaetPct)}%</span>
              </div>
            </div>
            {/* Sub-Hebel horizontal */}
            <div className="flex gap-3">
              {(["multiCaseRate", "frequenz", "monitorZeit"] as SubKey[]).map((subKey) => {
                const meta = SUB_COLORS[subKey];
                const { kunde, benchmark } = getSubValues(row, subKey);
                const pctField = `${subKey}_pct` as keyof BenchmarkRow;
                const pct = row[pctField] as number;
                const worse = isWorse(subKey);
                return (
                  <div key={subKey} className="flex flex-col items-center min-w-[65px]">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span className="text-[8px] font-medium" style={{ color: meta.color }}>{meta.label}</span>
                    </div>
                    <span className="text-[10px] tabular-nums font-semibold" style={{ color: worse ? "hsl(var(--destructive))" : "hsl(var(--foreground))" }}>
                      {fmtDe(kunde)} {meta.unit}
                    </span>
                    <span className="text-[9px] tabular-nums text-primary">
                      {fmtDe(benchmark)} {meta.unit}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-8 h-[3px] rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: meta.color }} />
                      </div>
                      <span className="text-[7px] font-medium tabular-nums" style={{ color: meta.color }}>{Math.round(pct)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export default function DetailTable({
  data,
  onSelectParam,
  onSelectDrg,
  onSelectFach,
}: Props) {
  const [sortField, setSortField] = useState<SortField>("hauptpot_net_euro");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  const enriched = useMemo(
    () =>
      data.map((r) => {
        const netEuro = r.hauptpot_net_analysen * r.befundpreis;
        const brutEuro = netEuro * 1.35;
        const verlustEuro = brutEuro - netEuro;
        return {
          ...r,
          hauptpot_net_euro: netEuro,
          hauptpot_brut_euro: brutEuro,
          erlosverlust_euro: verlustEuro,
        };
      }),
    [data]
  );

  const sorted = useMemo(() => {
    const copy = [...enriched];
    copy.sort((a, b) => {
      const av = a[sortField as keyof typeof a];
      const bv = b[sortField as keyof typeof b];
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
    return copy;
  }, [enriched, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const pageData = sorted.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(0);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-30 ml-0.5 inline" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary ml-0.5 inline" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary ml-0.5 inline" />
    );
  };

  const HeadCell = ({
    field,
    label,
    align = "right",
    className = "",
  }: {
    field: SortField;
    label: string;
    align?: "left" | "right";
    className?: string;
  }) => (
    <TableHead
      className={`text-[10px] font-medium px-2.5 py-2 whitespace-nowrap cursor-pointer hover:bg-muted/50 transition-colors select-none ${
        align === "left" ? "text-left" : "text-right"
      } ${className}`}
      onClick={() => toggleSort(field)}
    >
      <span className={`inline-flex items-center gap-0.5 ${align === "left" ? "" : "justify-end"}`}>
        {label}
        <SortIcon field={field} />
      </span>
    </TableHead>
  );

  return (
    <TooltipProvider delayDuration={100}>
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1" style={{ maxHeight: "calc(100vh - 280px)" }}>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <HeadCell field="parameter_name" label="Parameter" align="left" />
                <HeadCell field="drg" label="DRG" align="left" />
                <HeadCell field="fachabteilung" label="Fachabteilung" align="left" />
                <HeadCell field="analysen_pro_fall_kunde" label="A/F Kunde" />
                <HeadCell field="analysen_pro_fall_benchmark" label="A/F Benchmark" />
                <HeadCell field="hauptpot_net_analysen" label="Pot. Analysen" />
                <HeadCell field="hauptpot_brut_euro" label="Pot. EUR" />
                <HeadCell field="erlosverlust_euro" label="Erlosverluste" className="text-red-400" />
                <HeadCell field="hauptpot_net_euro" label="Pot. EUR netto" className="font-semibold" />
                <TableHead className="text-[10px] font-medium px-3 py-2 whitespace-nowrap text-center min-w-[100px]">
                  Hebel
                </TableHead>
                {SUB_KEYS.map((key) => (
                  <TableHead
                    key={key}
                    className="text-[10px] font-medium px-2 py-2 whitespace-nowrap cursor-pointer hover:bg-muted/50 transition-colors select-none text-center min-w-[75px]"
                    onClick={() => toggleSort(`${key}_pct` as SortField)}
                  >
                    <span className="inline-flex items-center gap-1 justify-center">
                      <span
                        className="h-2 w-2 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: SUB_COLORS[key].color }}
                      />
                      <span className="truncate">{SUB_COLORS[key].label}</span>
                      <SortIcon field={`${key}_pct` as SortField} />
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.map((row, idx) => (
                <TableRow
                  key={`${row.parameter_name}-${row.drg}-${row.fachabteilung}-${idx}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell
                    className="px-2.5 py-2 text-[11px] font-medium cursor-pointer hover:text-primary hover:underline underline-offset-2 whitespace-nowrap max-w-[180px] truncate"
                    onClick={() => onSelectParam(row.parameter_name)}
                    title={row.parameter_name}
                  >
                    {row.parameter_name}
                  </TableCell>
                  <TableCell
                    className="px-2.5 py-2 text-[11px] font-medium cursor-pointer hover:text-primary hover:underline underline-offset-2 whitespace-nowrap"
                    onClick={() => onSelectDrg(row.drg)}
                  >
                    {row.drg}
                  </TableCell>
                  <TableCell
                    className="px-2.5 py-2 text-[11px] font-medium cursor-pointer hover:text-primary hover:underline underline-offset-2 whitespace-nowrap max-w-[140px] truncate"
                    onClick={() => onSelectFach(row.fachabteilung)}
                    title={row.fachabteilung}
                  >
                    {row.fachabteilung}
                  </TableCell>
                  {/* A/F Kunde */}
                  <TableCell className="px-2.5 py-2 text-[11px] text-right tabular-nums text-muted-foreground whitespace-nowrap">
                    {fmtDe(row.analysen_pro_fall_kunde)}
                  </TableCell>
                  {/* A/F Benchmark */}
                  <TableCell className="px-2.5 py-2 text-[11px] text-right tabular-nums text-muted-foreground whitespace-nowrap">
                    {fmtDe(row.analysen_pro_fall_benchmark)}
                  </TableCell>
                  {/* Pot. Analysen -- normal style like A/F Kunde */}
                  <TableCell className="px-2.5 py-2 text-[11px] text-right tabular-nums text-muted-foreground whitespace-nowrap">
                    {fmtDe(row.hauptpot_net_analysen, 0)}
                  </TableCell>
                  {/* Pot. EUR (brutto) -- normal style */}
                  <TableCell className="px-2.5 py-2 text-[11px] text-right tabular-nums text-muted-foreground whitespace-nowrap">
                    {fmtEur(row.hauptpot_brut_euro)}
                  </TableCell>
                  {/* Erlosverluste -- red tinted */}
                  <TableCell className="px-2.5 py-2 text-[11px] text-right tabular-nums text-red-400 whitespace-nowrap">
                    -{fmtEur(row.erlosverlust_euro)}
                  </TableCell>
                  {/* Pot. EUR netto -- bold black */}
                  <TableCell className="px-2.5 py-2 text-[11px] text-right tabular-nums font-bold text-foreground whitespace-nowrap">
                    {fmtEur(row.hauptpot_net_euro)}
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <StackedBar row={row} />
                  </TableCell>
                  <TableCell colSpan={4} className="p-0">
                    <ValueCellsGroup row={row} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-2.5 border-t flex items-center justify-between bg-muted/30">
          <p className="text-[11px] text-muted-foreground">
            {fmtInt(sorted.length)} Zeilen
            {sorted.length > ITEMS_PER_PAGE && (
              <span>
                {" "}&middot; Seite {page + 1} von {totalPages}
              </span>
            )}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPage(0)} disabled={page === 0}>
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-[11px] text-muted-foreground px-2 tabular-nums">
                {page + 1} / {totalPages}
              </span>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
