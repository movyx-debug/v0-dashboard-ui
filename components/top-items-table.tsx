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
import type React from "react";

const fmtInt = (n: number) => Math.round(n).toLocaleString("de-DE");
const fmtEur = (n: number) =>
  `${Math.round(n).toLocaleString("de-DE")} \u20AC`;

/* ── Sub-benchmark colors & labels ───────────────────────────── */
// Indikation: blau, Intensitat-SubHebel: Orange-Gelb-Braun Palette
const INDIKATION_COLOR = "#5b8ab5";
const INTENSITAET_COLOR = "#e07a34"; // aggregierte Intensitaet-Farbe (orange)

const SUBS = [
  { key: "indikation_pct" as const, color: INDIKATION_COLOR, label: "Indikation", isIntensitaet: false },
  { key: "multiCaseRate_pct" as const, color: "#d97706", label: "Monitorfallrate", isIntensitaet: true }, // amber-600
  { key: "frequenz_pct" as const, color: "#ca8a04", label: "Frequenz", isIntensitaet: true }, // yellow-600
  { key: "monitorZeit_pct" as const, color: "#92400e", label: "Monitorzeit", isIntensitaet: true }, // amber-800 (braun)
];

/* ── Stacked bar with hover popup ──────────────────────────── */
function StackedBar({ item }: { item: TopItem }) {
  const segments = SUBS.map((s) => ({
    ...s,
    pct: item[s.key],
  })).filter((s) => s.pct > 0);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex h-[9px] w-full rounded-full overflow-hidden bg-secondary cursor-default">
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
                  width: `${Math.min(item.indikation_pct, 100)}%`,
                  backgroundColor: INDIKATION_COLOR,
                  opacity: item.indikation_pct === 0 ? 0.15 : 1,
                }}
              />
            </div>
            <span
              className="text-[11px] font-semibold tabular-nums w-[32px] text-right"
              style={{ color: item.indikation_pct > 0 ? INDIKATION_COLOR : "hsl(var(--muted-foreground))" }}
            >
              {Math.round(item.indikation_pct)}%
            </span>
          </div>
          
          {/* Intensitaet Gesamt */}
          {(() => {
            const intensitaetPct = item.multiCaseRate_pct + item.frequenz_pct + item.monitorZeit_pct;
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
            {SUBS.filter(s => s.isIntensitaet).map((s) => {
              const pct = item[s.key];
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
                <TableHead className="text-xs px-2 py-2 text-right whitespace-nowrap">Pot. Analysen</TableHead>
                <TableHead className="text-xs px-2 py-2 text-right whitespace-nowrap font-semibold">Pot. EUR</TableHead>
                <TableHead className="text-xs px-3 py-2 text-center min-w-[100px]">Hebel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const isActive = activeItem === item.name;
                return (
                  <TableRow
                    key={item.name}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${isActive ? "bg-muted/70" : ""}`}
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
                    {/* Pot. Analysen -- normal style like A/F Kunde */}
                    <TableCell className="px-2 py-2.5 text-right text-xs tabular-nums text-muted-foreground">
                      {fmtInt(item.potentialAnalyses)}
                    </TableCell>
                    {/* Pot. EUR -- bold black */}
                    <TableCell className="px-2 py-2.5 text-right text-xs tabular-nums font-bold text-foreground">
                      {fmtEur(item.potentialEuro)}
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
