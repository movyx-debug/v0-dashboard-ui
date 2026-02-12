"use client";

import { useState } from "react";
import type { AggregatedBenchmark } from "@/lib/benchmark-data";
import {
  Activity,
  Repeat2,
  Clock,
  Timer,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  FlaskConical,
  Beaker,
  Users,
  BarChart3,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const fmtDe = (n: number, dec = 2) =>
  n.toLocaleString("de-DE", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });

const fmtPct = (n: number) => `${Math.round(n)}%`;
const fmtInt = (n: number) => Math.round(n).toLocaleString("de-DE");

const SUB_META = {
  indikation: {
    color: "#3b82f6",
    bgLight: "rgba(59,130,246,0.08)",
    icon: Activity,
    label: "Indikation",
    desc: "Wird der Parameter bei zu vielen Patienten angefordert?",
    longDesc:
      "Vergleich der Indikationsquote: In wie viel Prozent der Falle wird der Parameter initial angefordert? Ein hoherer Wert als der Benchmark kann darauf hindeuten, dass der Parameter bei zu vielen Patienten routinemassig bestellt wird.",
    unit: "%",
  },
  multiCaseRate: {
    color: "#f59e0b",
    bgLight: "rgba(245,158,11,0.08)",
    icon: Repeat2,
    label: "MultiCaseRate",
    desc: "Gehen zu viele Falle ins Monitoring?",
    longDesc:
      "Vergleich der MultiCaseRate: Welcher Anteil der Falle mit Erstanforderung wird wiederholt untersucht (Monitoring)? Ein hoherer Wert bedeutet, dass mehr Patienten als notig ins Monitoring gehen.",
    unit: "%",
  },
  frequenz: {
    color: "#10b981",
    bgLight: "rgba(16,185,129,0.08)",
    icon: Clock,
    label: "Frequenz",
    desc: "Wird der Parameter zu haufig nachbestellt?",
    longDesc:
      "Vergleich der Anforderungsfrequenz: Wie viele Tage liegen im Schnitt zwischen zwei Anforderungen? Ein niedrigerer Wert als der Benchmark bedeutet, dass haufiger als notig nachbestellt wird.",
    unit: "Tage",
  },
  monitorZeit: {
    color: "#8b5cf6",
    bgLight: "rgba(139,92,246,0.08)",
    icon: Timer,
    label: "Monitorzeit",
    desc: "Dauert das Monitoring zu lange?",
    longDesc:
      "Vergleich der Monitoring-Zeitspanne: Wie viele Tage wird ein Patient im Schnitt uberwacht? Ein hoherer Wert deutet auf unnotig langes Monitoring hin.",
    unit: "Tage",
  },
} as const;

type SubKey = keyof typeof SUB_META;
const SUB_KEYS: SubKey[] = ["indikation", "multiCaseRate", "frequenz", "monitorZeit"];

interface Props {
  benchmark: AggregatedBenchmark;
  title: string;
}

export default function BenchmarkSection({ benchmark, title }: Props) {
  const [openSub, setOpenSub] = useState<SubKey | null>(null);

  const diff =
    benchmark.analysen_pro_fall_kunde - benchmark.analysen_pro_fall_benchmark;
  const diffPct =
    benchmark.analysen_pro_fall_benchmark > 0
      ? (diff / benchmark.analysen_pro_fall_benchmark) * 100
      : 0;
  const isAbove = diff > 0;
  const savingsQuote =
    benchmark.total_analysen > 0
      ? (benchmark.hauptpot_net_analysen / benchmark.total_analysen) * 100
      : 0;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        {/* ── Compact top row: Title + Context ─────────────────────── */}
        <div className="px-5 py-3 border-b flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <FlaskConical className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Benchmarking</p>
              <p className="text-sm font-semibold text-foreground leading-tight">
                {title}
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isAbove
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            }`}
          >
            {isAbove ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {isAbove ? "+" : ""}
            {fmtPct(Math.abs(diffPct))} vs. Benchmark
          </div>
        </div>

        {/* ── Main result row ──────────────────────────────────────── */}
        <div className="px-5 py-5">
          <div className="flex items-start gap-6 lg:gap-10 flex-wrap">
            {/* Big EUR number */}
            <div className="flex-shrink-0">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                Netto-Potenzial
              </p>
              <p className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-none">
                {fmtInt(benchmark.hauptpot_net_euro)}
                <span className="text-lg lg:text-xl font-semibold text-muted-foreground ml-1.5">
                  EUR
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                {fmtInt(benchmark.hauptpot_net_analysen)} einsparbare Analysen
              </p>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-20 bg-border self-center" />

            {/* Analysen / Fall comparison */}
            <div className="flex-shrink-0">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                Analysen pro Fall
              </p>
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-2xl font-bold text-foreground leading-none">
                    {fmtDe(benchmark.analysen_pro_fall_kunde)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Ihre Einrichtung
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground mb-2.5" />
                <div>
                  <p className="text-2xl font-bold text-primary leading-none">
                    {fmtDe(benchmark.analysen_pro_fall_benchmark)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Benchmark
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-20 bg-border self-center" />

            {/* Quick stats */}
            <div className="flex gap-5 flex-wrap">
              <QuickStat
                icon={<Beaker className="h-3.5 w-3.5" />}
                label="Analysen"
                value={fmtInt(benchmark.total_analysen)}
              />
              <QuickStat
                icon={<Users className="h-3.5 w-3.5" />}
                label="Falle"
                value={fmtInt(benchmark.total_faelle)}
              />
              <QuickStat
                icon={<BarChart3 className="h-3.5 w-3.5" />}
                label="Einsparquote"
                value={fmtPct(savingsQuote)}
                highlight
              />
            </div>
          </div>

          {/* ── Sub-benchmark stacked bar ────────────────────────── */}
          <div className="mt-5 pt-5 border-t">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                Potenzial-Hebel
              </p>
              <p className="text-[11px] text-muted-foreground">
                Klicken fur Details
              </p>
            </div>

            {/* Stacked horizontal bar */}
            <div className="flex rounded-xl overflow-hidden h-10 bg-secondary cursor-pointer">
              {SUB_KEYS.map((key) => {
                const sub = benchmark[key];
                const meta = SUB_META[key];
                if (sub.pct <= 0) return null;

                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="relative h-full transition-all hover:brightness-110 hover:scale-y-105 origin-bottom focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{
                          width: `${sub.pct}%`,
                          backgroundColor: meta.color,
                          minWidth: sub.pct > 3 ? "auto" : "12px",
                        }}
                        onClick={() => setOpenSub(key)}
                        aria-label={`${meta.label}: ${fmtPct(sub.pct)}`}
                      >
                        {sub.pct > 10 && (
                          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white drop-shadow-sm">
                            {fmtPct(sub.pct)}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-card text-foreground border shadow-lg p-3 max-w-[220px]"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="font-semibold text-sm">
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {meta.desc}
                      </p>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Anteil</span>
                        <span className="font-bold">{fmtPct(sub.pct)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Einsparbar
                        </span>
                        <span className="font-semibold">
                          {fmtInt(sub.analysen)} Analysen
                        </span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            {/* Legend row */}
            <div className="flex items-center gap-4 mt-2.5 flex-wrap">
              {SUB_KEYS.map((key) => {
                const sub = benchmark[key];
                const meta = SUB_META[key];
                if (sub.pct <= 0) return null;
                const Icon = meta.icon;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setOpenSub(key)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
                  >
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform"
                      style={{ backgroundColor: meta.color }}
                    />
                    <Icon className="h-3 w-3 opacity-50" />
                    <span>
                      {meta.label}{" "}
                      <span className="font-semibold text-foreground">
                        {fmtPct(sub.pct)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={openSub !== null}
        onOpenChange={(open) => {
          if (!open) setOpenSub(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {openSub && (
            <SubBenchmarkDetail
              subKey={openSub}
              benchmark={benchmark}
              onNavigate={(key) => setOpenSub(key)}
            />
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

/* ── Quick stat chip ─────────────────────────────────────────────────────── */

function QuickStat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-[10px] text-muted-foreground leading-tight">
          {label}
        </p>
        <p
          className={`text-sm font-bold leading-tight ${highlight ? "text-primary" : "text-foreground"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ── Sub-Benchmark Detail Dialog Content ─────────────────────────────── */

function SubBenchmarkDetail({
  subKey,
  benchmark,
  onNavigate,
}: {
  subKey: SubKey;
  benchmark: AggregatedBenchmark;
  onNavigate: (key: SubKey) => void;
}) {
  const meta = SUB_META[subKey];
  const sub = benchmark[subKey];
  const Icon = meta.icon;

  const isWorse =
    subKey === "frequenz" || subKey === "monitorZeit"
      ? sub.kunde < sub.benchmark
      : sub.kunde > sub.benchmark;

  const maxVal = Math.max(sub.kunde, sub.benchmark, 0.01);

  // Navigate to adjacent sub-benchmark
  const currentIdx = SUB_KEYS.indexOf(subKey);
  const prevKey = currentIdx > 0 ? SUB_KEYS[currentIdx - 1] : null;
  const nextKey =
    currentIdx < SUB_KEYS.length - 1 ? SUB_KEYS[currentIdx + 1] : null;

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ backgroundColor: meta.bgLight }}
          >
            <Icon className="h-5 w-5" style={{ color: meta.color }} />
          </div>
          <div>
            <DialogTitle className="text-lg">{meta.label}</DialogTitle>
            <DialogDescription className="text-xs">
              {meta.desc}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Explanation */}
      <p className="text-xs text-muted-foreground leading-relaxed -mt-1">
        {meta.longDesc}
      </p>

      {/* Key numbers */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl border p-3"
          style={{ borderColor: `${meta.color}30` }}
        >
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Anteil am Potenzial
          </p>
          <p className="text-2xl font-bold" style={{ color: meta.color }}>
            {fmtPct(sub.pct)}
          </p>
        </div>
        <div className="rounded-xl border p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Einsparbare Analysen
          </p>
          <p className="text-2xl font-bold text-foreground">
            {fmtInt(sub.analysen)}
          </p>
        </div>
      </div>

      {/* Kunde vs Benchmark bars */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-foreground">
          Kunde vs. Benchmark
        </p>

        {/* Kunde bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Ihre Einrichtung</span>
            <span
              className="font-bold"
              style={{
                color: isWorse
                  ? "hsl(var(--destructive))"
                  : "hsl(var(--primary))",
              }}
            >
              {fmtDe(sub.kunde)} {meta.unit}
            </span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(sub.kunde / maxVal) * 100}%`,
                backgroundColor: isWorse
                  ? "hsl(var(--destructive))"
                  : meta.color,
              }}
            />
          </div>
        </div>

        {/* Benchmark bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Benchmark</span>
            <span className="font-bold text-foreground">
              {fmtDe(sub.benchmark)} {meta.unit}
            </span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground/30 transition-all duration-500"
              style={{
                width: `${(sub.benchmark / maxVal) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Interpretation */}
        <div
          className={`rounded-lg p-2.5 text-xs ${
            isWorse
              ? "bg-destructive/5 text-destructive border border-destructive/15"
              : "bg-primary/5 text-primary border border-primary/15"
          }`}
        >
          {isWorse
            ? `Ihr Wert liegt ${subKey === "frequenz" || subKey === "monitorZeit" ? "unter" : "uber"} dem Benchmark. Hier besteht Optimierungsbedarf.`
            : "Ihr Wert liegt im oder unter dem Benchmark. Kein akuter Handlungsbedarf."}
        </div>
      </div>

      {/* Navigation between sub-benchmarks */}
      <div className="flex items-center justify-between pt-1 border-t">
        {prevKey ? (
          <button
            type="button"
            onClick={() => onNavigate(prevKey)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: SUB_META[prevKey].color }}
            />
            {SUB_META[prevKey].label}
          </button>
        ) : (
          <div />
        )}
        {nextKey ? (
          <button
            type="button"
            onClick={() => onNavigate(nextKey)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {SUB_META[nextKey].label}
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: SUB_META[nextKey].color }}
            />
          </button>
        ) : (
          <div />
        )}
      </div>
    </>
  );
}
