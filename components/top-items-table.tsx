"use client";

import type { TopItem } from "@/lib/benchmark-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowDown, Minus, Equal } from "lucide-react";
import type React from "react";

const fmtInt = (n: number) => Math.round(n).toLocaleString("de-DE");
const fmtEur = (n: number) =>
  `${Math.round(n).toLocaleString("de-DE")} \u20AC`;

/* ── Sub-benchmark colors & labels ───────────────────────────── */
const SUBS = [
  { key: "indikation_pct" as const, color: "#3b82f6", label: "Indikation" },
  {
    key: "multiCaseRate_pct" as const,
    color: "#f59e0b",
    label: "MultiCaseRate",
  },
  { key: "frequenz_pct" as const, color: "#10b981", label: "Frequenz" },
  { key: "monitorZeit_pct" as const, color: "#8b5cf6", label: "Monitorzeit" },
];

/* ── Potenzial breakdown tooltip ─────────────────────────────── */
function PotenzialTooltip({
  item,
  mode,
  children,
}: {
  item: TopItem;
  mode: "analysen" | "euro";
  children: React.ReactNode;
}) {
  const isEuro = mode === "euro";
  const fmt = isEuro ? fmtEur : fmtInt;
  const brutto = isEuro ? item.bruttoEuro : item.bruttoAnalyses;
  const verlust = isEuro ? item.erlosverlustEuro : item.erlosverlustAnalyses;
  const netto = isEuro ? item.potentialEuro : item.potentialAnalyses;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-card text-foreground border shadow-lg px-4 py-3 min-w-[200px]"
      >
        <p className="text-[10px] text-muted-foreground mb-2.5 font-medium uppercase tracking-wider">
          Zusammensetzung {isEuro ? "(EUR)" : "(Analysen)"}
        </p>
        <div className="flex flex-col gap-2">
          {/* Brutto */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-foreground">
              Einsparung durch Reduktion
            </span>
            <span className="text-[12px] font-bold tabular-nums text-emerald-600">
              {fmt(brutto)}
            </span>
          </div>
          {/* Minus divider */}
          <div className="flex items-center gap-2">
            <Minus className="h-3 w-3 text-muted-foreground" />
            <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
          </div>
          {/* Erlosverlust */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-foreground">
              Erlosverluste durch Reduktion
            </span>
            <span className="text-[12px] font-bold tabular-nums text-red-500">
              {fmt(verlust)}
            </span>
          </div>
          {/* Equals divider */}
          <div className="flex items-center gap-2">
            <Equal className="h-3 w-3 text-muted-foreground" />
            <div className="flex-1 border-t border-muted-foreground/40" />
          </div>
          {/* Netto */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-semibold text-foreground">
              Netto-Potenzial
            </span>
            <span className="text-[13px] font-extrabold tabular-nums text-primary">
              {fmt(netto)}
            </span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/* ── Stacked bar with hover popup ──────────────────────────── */
function StackedBar({ item }: { item: TopItem }) {
  const segments = SUBS.map((s) => ({
    ...s,
    pct: item[s.key],
  })).filter((s) => s.pct > 0);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex h-[7px] w-full rounded-full overflow-hidden bg-secondary cursor-default">
          {segments.map((seg) => (
            <div
              key={seg.key}
              className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
              style={{
                width: `${seg.pct}%`,
                backgroundColor: seg.color,
              }}
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
          {SUBS.map((s) => {
            const pct = item[s.key];
            return (
              <div key={s.key} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-[11px] text-foreground w-[90px]">
                  {s.label}
                </span>
                <div className="w-16 h-[5px] rounded-full bg-secondary overflow-hidden">
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
                  className="text-[11px] font-semibold tabular-nums w-[32px] text-right"
                  style={{
                    color:
                      pct > 0 ? s.color : "hsl(var(--muted-foreground))",
                  }}
                >
                  {Math.round(pct)}%
                </span>
              </div>
            );
          })}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/* ── Main component ────────────────────────────────────────── */
interface Props {
  title: string;
  icon: React.ReactNode;
  items: TopItem[];
  activeItem: string | null;
  onSelect: (name: string) => void;
  accentColor: string;
}

export default function TopItemsTable({
  title,
  icon,
  items,
  activeItem,
  onSelect,
  accentColor,
}: Props) {
  return (
    <TooltipProvider delayDuration={120}>
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[380px]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b flex items-center gap-2 flex-shrink-0">
          {icon}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">
            Klicken zum Filtern
          </span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="text-xs px-4 py-2">Name</TableHead>
                <TableHead className="text-xs px-3 py-2 text-right">
                  Pot. Analysen
                </TableHead>
                <TableHead className="text-xs px-3 py-2 text-right">
                  Pot. EUR
                </TableHead>
                <TableHead className="text-xs px-3 py-2 text-center min-w-[100px]">
                  Hebel
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const isActive = activeItem === item.name;
                return (
                  <TableRow
                    key={item.name}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      isActive ? "bg-muted/70" : ""
                    }`}
                    onClick={() => onSelect(item.name)}
                  >
                    <TableCell className="px-4 py-2.5 text-xs font-medium text-foreground max-w-[180px] truncate">
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <div
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: accentColor }}
                          />
                        )}
                        <span className="truncate">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right">
                      <PotenzialTooltip item={item} mode="analysen">
                        <span className="text-xs font-semibold text-foreground tabular-nums cursor-default border-b border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors">
                          {fmtInt(item.potentialAnalyses)}
                        </span>
                      </PotenzialTooltip>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right">
                      <PotenzialTooltip item={item} mode="euro">
                        <span className="text-xs text-muted-foreground tabular-nums cursor-default border-b border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors">
                          {fmtEur(item.potentialEuro)}
                        </span>
                      </PotenzialTooltip>
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <StackedBar item={item} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}
