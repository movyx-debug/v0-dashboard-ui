"use client";

import { useMemo, useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const fmtDe = (n: number | null, dec = 2) =>
  n === null
    ? "-"
    : n.toLocaleString("de-DE", {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      });
const fmtInt = (n: number) => Math.round(n).toLocaleString("de-DE");
const fmtPct = (n: number) => `${Math.round(n)}%`;

type SortField =
  | "parameter_name"
  | "drg"
  | "fachabteilung"
  | "faelle_kunde"
  | "analysen"
  | "analysen_pro_fall_kunde"
  | "analysen_pro_fall_benchmark"
  | "hauptpot_net_analysen"
  | "indikationsquote_kunde"
  | "indikationsquote_benchmark"
  | "multiCaseRate"
  | "multiCaseRate_benchmark"
  | "frequenz_tage_kunde"
  | "frequenz_tage_benchmark"
  | "span_kunde"
  | "span_benchmark"
  | "indikation_pct"
  | "multiCaseRate_pct"
  | "frequenz_pct"
  | "monitorZeit_pct";

type SortDir = "asc" | "desc";

const ITEMS_PER_PAGE = 50;

interface Props {
  data: BenchmarkRow[];
  onSelectParam: (name: string) => void;
  onSelectDrg: (name: string) => void;
  onSelectFach: (name: string) => void;
}

interface ColumnDef {
  field: SortField;
  label: string;
  group: string;
  render: (row: BenchmarkRow) => string;
  align?: "left" | "right";
}

const COLUMNS: ColumnDef[] = [
  { field: "parameter_name", label: "Parameter", group: "Basis", render: (r) => r.parameter_name, align: "left" },
  { field: "drg", label: "DRG", group: "Basis", render: (r) => r.drg, align: "left" },
  { field: "fachabteilung", label: "Fachabteilung", group: "Basis", render: (r) => r.fachabteilung, align: "left" },
  { field: "faelle_kunde", label: "Falle", group: "Basis", render: (r) => fmtInt(r.faelle_kunde) },
  { field: "analysen", label: "Analysen", group: "Basis", render: (r) => fmtInt(r.analysen) },
  { field: "analysen_pro_fall_kunde", label: "A/F Kunde", group: "Haupt-BM", render: (r) => fmtDe(r.analysen_pro_fall_kunde) },
  { field: "analysen_pro_fall_benchmark", label: "A/F Benchmark", group: "Haupt-BM", render: (r) => fmtDe(r.analysen_pro_fall_benchmark) },
  { field: "hauptpot_net_analysen", label: "Potenzial", group: "Haupt-BM", render: (r) => fmtDe(r.hauptpot_net_analysen, 0) },
  { field: "indikationsquote_kunde", label: "Ind. Kunde", group: "Indikation", render: (r) => fmtDe(r.indikationsquote_kunde, 1) },
  { field: "indikationsquote_benchmark", label: "Ind. BM", group: "Indikation", render: (r) => fmtDe(r.indikationsquote_benchmark, 1) },
  { field: "indikation_pct", label: "Ind. %", group: "Indikation", render: (r) => fmtPct(r.indikation_pct) },
  { field: "multiCaseRate", label: "MCR Kunde", group: "MultiCase", render: (r) => fmtDe(r.multiCaseRate) },
  { field: "multiCaseRate_benchmark", label: "MCR BM", group: "MultiCase", render: (r) => fmtDe(r.multiCaseRate_benchmark) },
  { field: "multiCaseRate_pct", label: "MCR %", group: "MultiCase", render: (r) => fmtPct(r.multiCaseRate_pct) },
  { field: "frequenz_tage_kunde", label: "Freq. Kunde", group: "Frequenz", render: (r) => fmtDe(r.frequenz_tage_kunde) },
  { field: "frequenz_tage_benchmark", label: "Freq. BM", group: "Frequenz", render: (r) => fmtDe(r.frequenz_tage_benchmark) },
  { field: "frequenz_pct", label: "Freq. %", group: "Frequenz", render: (r) => fmtPct(r.frequenz_pct) },
  { field: "span_kunde", label: "Span Kunde", group: "Monitorzeit", render: (r) => fmtDe(r.span_kunde) },
  { field: "span_benchmark", label: "Span BM", group: "Monitorzeit", render: (r) => fmtDe(r.span_benchmark) },
  { field: "monitorZeit_pct", label: "Mon. %", group: "Monitorzeit", render: (r) => fmtPct(r.monitorZeit_pct) },
];

const GROUP_COLORS: Record<string, string> = {
  "Basis": "border-b-muted-foreground/30",
  "Haupt-BM": "border-b-primary/40",
  "Indikation": "border-b-blue-500/40",
  "MultiCase": "border-b-amber-500/40",
  "Frequenz": "border-b-emerald-500/40",
  "Monitorzeit": "border-b-violet-500/40",
};

export default function DetailTable({ data, onSelectParam, onSelectDrg, onSelectFach }: Props) {
  const [sortField, setSortField] = useState<SortField>("hauptpot_net_analysen");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
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
  }, [data, sortField, sortDir]);

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

  // Build column group spans for the header
  const groups = useMemo(() => {
    const g: { name: string; span: number }[] = [];
    for (const col of COLUMNS) {
      if (g.length > 0 && g[g.length - 1].name === col.group) {
        g[g.length - 1].span++;
      } else {
        g.push({ name: col.group, span: 1 });
      }
    }
    return g;
  }, []);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-30 ml-1" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary ml-1" />
    );
  };

  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Table scroll container */}
      <div className="overflow-auto flex-1" style={{ maxHeight: "calc(100vh - 280px)" }}>
        <Table>
          <TableHeader className="sticky top-0 z-10">
            {/* Group row */}
            <TableRow className="bg-muted/50 border-b-0">
              {groups.map((g) => (
                <TableHead
                  key={g.name}
                  colSpan={g.span}
                  className={`text-[10px] uppercase tracking-wider text-center font-semibold py-1.5 border-b-2 ${GROUP_COLORS[g.name] || ""}`}
                >
                  {g.name}
                </TableHead>
              ))}
            </TableRow>
            {/* Column headers */}
            <TableRow className="bg-card">
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.field}
                  className={`text-[10px] font-medium px-2.5 py-2 whitespace-nowrap cursor-pointer hover:bg-muted/50 transition-colors select-none ${col.align === "left" ? "text-left" : "text-right"}`}
                  onClick={() => toggleSort(col.field)}
                >
                  <span className={`inline-flex items-center ${col.align === "left" ? "" : "justify-end"}`}>
                    {col.label}
                    <SortIcon field={col.field} />
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((row, idx) => (
              <TableRow key={`${row.parameter_name}-${row.drg}-${row.fachabteilung}-${idx}`} className="hover:bg-muted/30">
                {COLUMNS.map((col) => {
                  const isClickable = col.field === "parameter_name" || col.field === "drg" || col.field === "fachabteilung";
                  const handleClick = isClickable
                    ? () => {
                        if (col.field === "parameter_name") onSelectParam(row.parameter_name);
                        else if (col.field === "drg") onSelectDrg(row.drg);
                        else if (col.field === "fachabteilung") onSelectFach(row.fachabteilung);
                      }
                    : undefined;

                  return (
                    <TableCell
                      key={col.field}
                      className={`px-2.5 py-2 text-[11px] tabular-nums whitespace-nowrap ${
                        col.align === "left" ? "text-left" : "text-right"
                      } ${isClickable ? "cursor-pointer hover:text-primary hover:underline underline-offset-2 font-medium" : "text-muted-foreground"} ${
                        col.field === "hauptpot_net_analysen" ? "font-semibold text-foreground" : ""
                      }`}
                      onClick={handleClick}
                    >
                      {col.render(row)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-2.5 border-t flex items-center justify-between bg-muted/30">
        <p className="text-[11px] text-muted-foreground">
          {fmtInt(sorted.length)} Zeilen insgesamt
          {sorted.length > ITEMS_PER_PAGE && (
            <span>
              {" "}&middot; Seite {page + 1} von {totalPages}
            </span>
          )}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setPage(0)}
              disabled={page === 0}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[11px] text-muted-foreground px-2 tabular-nums">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
