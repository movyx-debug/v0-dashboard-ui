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
  | "faelle_kunde"
  | "faelle_benchmark"
  | "analysen_kunde"
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

/* ── Combined Hebel + Values cells with single hover trigger ── */
function HebelAndValuesCells({ row }: { row: BenchmarkRow }) {
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
  const indikationPct = row.indikation_pct;

  // Only 2 segments: Indikation + Intensitaet (aggregated)
  const segments = [
    { key: "indikation", pct: indikationPct, color: INDIKATION_COLOR },
    { key: "intensitaet", pct: intensitaetPct, color: INTENSITAET_COLOR },
  ].filter((s) => s.pct > 0);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] cursor-default">
          {/* Hebel stacked bar - only 2 bars: Indikation vs Intensitaet */}
          <div className="flex items-center px-3 py-2">
            <div className="flex h-[8px] w-full min-w-[80px] rounded-full overflow-hidden bg-secondary">
              {segments.map((seg) => (
                <div
                  key={seg.key}
                  className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full border-r border-white/80 last:border-r-0"
                  style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                />
              ))}
            </div>
          </div>
          {/* 4 value columns */}
          {SUB_KEYS.map((subKey) => {
            const meta = SUB_COLORS[subKey];
            const { kunde, benchmark } = getSubValues(row, subKey);
            const worse = isWorse(subKey);
            return (
              <div key={subKey} className="flex flex-col items-center px-2 py-2">
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
        className="bg-card text-foreground border shadow-lg px-4 py-3"
      >
        <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wider">
          Anteil am Potenzial
        </p>
        {/* Horizontal layout - all metrics side by side */}
        <div className="flex items-start gap-5">
          {/* Indikation */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: INDIKATION_COLOR }} />
              <span className="text-[11px] font-semibold" style={{ color: INDIKATION_COLOR }}>Indikation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-[6px] rounded-full bg-secondary overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${Math.min(row.indikation_pct, 100)}%`, 
                    backgroundColor: INDIKATION_COLOR,
                    opacity: row.indikation_pct === 0 ? 0.15 : 1,
                  }} 
                />
              </div>
              <span className="text-[12px] font-bold tabular-nums w-[36px]" style={{ color: INDIKATION_COLOR }}>
                {Math.round(row.indikation_pct)}%
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-border self-stretch min-h-[50px]" />

          {/* Intensitaet (Gesamt) */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: INTENSITAET_COLOR }} />
              <span className="text-[11px] font-semibold" style={{ color: INTENSITAET_COLOR }}>Intensitat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-[6px] rounded-full bg-secondary overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    width: `${Math.min(intensitaetPct, 100)}%`, 
                    backgroundColor: INTENSITAET_COLOR,
                    opacity: intensitaetPct === 0 ? 0.15 : 1,
                  }} 
                />
              </div>
              <span className="text-[12px] font-bold tabular-nums w-[36px]" style={{ color: INTENSITAET_COLOR }}>
                {Math.round(intensitaetPct)}%
              </span>
            </div>
          </div>

          {/* Sub-Hebel der Intensitaet */}
          {(["multiCaseRate", "frequenz", "monitorZeit"] as SubKey[]).map((subKey) => {
            const meta = SUB_COLORS[subKey];
            const pctField = `${subKey}_pct` as keyof BenchmarkRow;
            const pct = row[pctField] as number;
            return (
              <div key={subKey} className="flex flex-col items-center">
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span className="text-[10px] font-medium" style={{ color: meta.color }}>{meta.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-14 h-[5px] rounded-full bg-secondary overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${Math.min(pct, 100)}%`, 
                        backgroundColor: meta.color,
                        opacity: pct === 0 ? 0.15 : 1,
                      }} 
                    />
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums w-[32px]" style={{ color: meta.color }}>
                    {Math.round(pct)}%
                  </span>
                </div>
              </div>
            );
          })}
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
    title,
    align = "right",
    className = "",
  }: {
    field: SortField;
    label: string;
    title?: string;
    align?: "left" | "right";
    className?: string;
  }) => (
    <TableHead
      className={`text-xs font-medium px-2 py-2 cursor-pointer hover:bg-muted/50 transition-colors select-none ${
        align === "left" ? "text-left" : "text-right"
      } ${className}`}
      onClick={() => toggleSort(field)}
      title={title || label}
    >
      <span className={`inline-flex items-center gap-0.5 ${align === "left" ? "" : "justify-end"}`}>
        <span className="leading-tight whitespace-pre-line text-center">{label}</span>
        <SortIcon field={field} />
      </span>
    </TableHead>
  );

  return (
    <TooltipProvider delayDuration={100}>
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b flex items-center gap-2 flex-shrink-0">
          <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <h3 className="text-sm font-semibold text-foreground">Detailansicht</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">
            {sorted.length} Einträge · Klicken zum Filtern
          </span>
        </div>
        <div className="overflow-auto flex-1" style={{ maxHeight: "calc(100vh - 320px)" }}>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <HeadCell field="parameter_name" label="Param." title="Parameter" align="left" />
                <HeadCell field="drg" label="DRG" align="left" />
                <HeadCell field="fachabteilung" label="Fach" title="Fachabteilung" align="left" />
                <HeadCell field="faelle_kunde" label={"Fälle\nKunde"} title="Fälle Kunde" />
                <HeadCell field="faelle_benchmark" label={"Fälle\nBM"} title="Fälle Benchmark" />
                <HeadCell field="analysen_kunde" label={"Anal.\nKunde"} title="Analysen Kunde" />
                <HeadCell field="hauptpot_net_analysen" label={"Pot.\nAnal."} title="Potenzial Analysen" />
                <HeadCell field="hauptpot_brut_euro" label={"Pot.\n€ brut"} title="Potenzial EUR brutto" />
                <HeadCell field="erlosverlust_euro" label={"Erlös-\nverl."} title="Erlösverluste" className="text-red-400" />
                <HeadCell field="hauptpot_net_euro" label={"Pot.\n€ net"} title="Potenzial EUR netto" className="font-semibold" />
                <TableHead className="text-xs font-medium px-2 py-2 text-center" title="Hebelverteilung">
                  Hebel
                </TableHead>
                {SUB_KEYS.map((key) => {
                  const shortLabels: Record<SubKey, string> = {
                    indikation: "Ind.",
                    multiCaseRate: "MFR",
                    frequenz: "Freq.",
                    monitorZeit: "MZ",
                  };
                  return (
                    <TableHead
                      key={key}
                      className="text-xs font-medium px-2 py-2 cursor-pointer hover:bg-muted/50 transition-colors select-none text-center"
                      onClick={() => toggleSort(`${key}_pct` as SortField)}
                      title={SUB_COLORS[key].label}
                    >
                      <span className="inline-flex items-center gap-1 justify-center">
                        <span
                          className="h-2 w-2 rounded-full inline-block flex-shrink-0"
                          style={{ backgroundColor: SUB_COLORS[key].color }}
                        />
                        <span className="whitespace-nowrap">{shortLabels[key]}</span>
                        <SortIcon field={`${key}_pct` as SortField} />
                      </span>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.map((row, idx) => (
                <TableRow
                  key={`${row.parameter_name}-${row.drg}-${row.fachabteilung}-${idx}`}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => {
                    onSelectParam(row.parameter_name);
                    onSelectDrg(row.drg);
                    onSelectFach(row.fachabteilung);
                  }}
                >
                  <TableCell
                    className="px-2 py-2 text-xs font-medium max-w-[100px] truncate hover:text-primary hover:underline underline-offset-2"
                    title={row.parameter_name}
                    onClick={(e) => { e.stopPropagation(); onSelectParam(row.parameter_name); }}
                  >
                    {row.parameter_name}
                  </TableCell>
                  <TableCell 
                    className="px-2 py-2 text-xs font-medium whitespace-nowrap hover:text-primary hover:underline underline-offset-2"
                    onClick={(e) => { e.stopPropagation(); onSelectDrg(row.drg); }}
                  >
                    {row.drg}
                  </TableCell>
                  <TableCell
                    className="px-2 py-2 text-xs font-medium max-w-[80px] truncate hover:text-primary hover:underline underline-offset-2"
                    title={row.fachabteilung}
                    onClick={(e) => { e.stopPropagation(); onSelectFach(row.fachabteilung); }}
                  >
                    {row.fachabteilung}
                  </TableCell>
                  {/* Falle Kunde */}
                  <TableCell className="px-2 py-2 text-xs text-right tabular-nums text-muted-foreground whitespace-nowrap">
                    {fmtInt(row.faelle_kunde)}
                  </TableCell>
                  {/* Falle Benchmark */}
                  <TableCell className="px-2 py-2 text-xs text-right tabular-nums text-primary whitespace-nowrap">
                    {fmtInt(row.faelle_benchmark)}
                  </TableCell>
                  {/* Analysen Kunde */}
                  <TableCell className="px-2 py-2 text-xs text-right tabular-nums text-muted-foreground whitespace-nowrap">
                    {fmtInt(row.analysen_kunde)}
                  </TableCell>
                  {/* Pot. Analysen -- normal style like A/F Kunde */}
                  <TableCell className="px-2 py-2 text-xs text-right tabular-nums text-muted-foreground whitespace-nowrap">
                    {fmtDe(row.hauptpot_net_analysen, 0)}
                  </TableCell>
                  {/* Pot. EUR (brutto) -- normal style */}
                  <TableCell className="px-2 py-2 text-xs text-right tabular-nums text-muted-foreground whitespace-nowrap">
                    {fmtEur(row.hauptpot_brut_euro)}
                  </TableCell>
                  {/* Erlosverluste -- red tinted */}
                  <TableCell className="px-2 py-2 text-xs text-right tabular-nums text-red-400 whitespace-nowrap">
                    -{fmtEur(row.erlosverlust_euro)}
                  </TableCell>
                  {/* Pot. EUR netto -- bold black */}
                  <TableCell className="px-2 py-2 text-xs text-right tabular-nums font-bold text-foreground whitespace-nowrap">
                    {fmtEur(row.hauptpot_net_euro)}
                  </TableCell>
                  <TableCell colSpan={5} className="p-0">
                    <HebelAndValuesCells row={row} />
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
