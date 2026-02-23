"use client";

import React, { useState, useMemo } from "react";
import type { AggregatedBenchmark } from "@/lib/benchmark-data";
import {
  Activity,
  Repeat2,
  Clock,
  Timer,
  TrendingDown,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
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
    color: "#5b8ab5",
    bgLight: "rgba(91,138,181,0.08)",
    icon: Activity,
    label: "Indikation",
    desc: "Wird der Parameter bei zu vielen Patienten angefordert?",
    longDesc:
      "Vergleich der Indikationsquote: In wie viel Prozent der Falle wird der Parameter initial angefordert? Ein hoherer Wert als der Benchmark kann darauf hindeuten, dass der Parameter bei zu vielen Patienten routinemassig bestellt wird.",
    unit: "%",
  },
  multiCaseRate: {
    color: "#cb7b5a",
    bgLight: "rgba(203,123,90,0.08)",
    icon: Repeat2,
    label: "MultiCaseRate",
    desc: "Gehen zu viele Falle ins Monitoring?",
    longDesc:
      "Vergleich der MultiCaseRate: Welcher Anteil der Falle mit Erstanforderung wird wiederholt untersucht (Monitoring)? Ein hoherer Wert bedeutet, dass mehr Patienten als notig ins Monitoring gehen.",
    unit: "%",
  },
  frequenz: {
    color: "#4da8a0",
    bgLight: "rgba(77,168,160,0.08)",
    icon: Clock,
    label: "Frequenz",
    desc: "Wird der Parameter zu haufig nachbestellt?",
    longDesc:
      "Vergleich der Anforderungsfrequenz: Wie viele Tage liegen im Schnitt zwischen zwei Anforderungen? Ein niedrigerer Wert als der Benchmark bedeutet, dass haufiger als notig nachbestellt wird.",
    unit: "Tage",
  },
  monitorZeit: {
    color: "#c07a8e",
    bgLight: "rgba(192,122,142,0.08)",
    icon: Timer,
    label: "Monitorzeit",
    desc: "Dauert das Monitoring zu lange?",
    longDesc:
      "Vergleich der Monitoring-Zeitspanne: Wie viele Tage wird ein Patient im Schnitt uberwacht? Ein hoherer Wert deutet auf unnotig langes Monitoring hin.",
    unit: "Tage",
  },
} as const;

type SubKey = keyof typeof SUB_META;
const SUB_KEYS: SubKey[] = [
  "indikation",
  "multiCaseRate",
  "frequenz",
  "monitorZeit",
];

interface Props {
  benchmark: AggregatedBenchmark;
  title: string;
}

const ORG_COLORS = ["#2d8a6e", "#5ab896", "#a3d9c4"];

export default function BenchmarkSection({ benchmark, title }: Props) {
  const [openSub, setOpenSub] = useState<SubKey | null>(null);

  // Key for donut animation: changes whenever data changes, triggering re-mount
  const donutKey = useMemo(
    () => benchmark.orgUnits.map((o) => `${o.name}:${Math.round(o.euro)}`).join("|"),
    [benchmark.orgUnits],
  );

  const diff =
    benchmark.analysen_pro_fall_kunde - benchmark.analysen_pro_fall_benchmark;
  const diffPct =
    benchmark.analysen_pro_fall_benchmark > 0
      ? (diff / benchmark.analysen_pro_fall_benchmark) * 100
      : 0;
  const isAbove = diff > 0;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        {/* Single horizontal cockpit row */}
        <div className="px-5 py-4 flex items-center gap-5 flex-wrap lg:flex-nowrap">
          {/* ── LEFT: Main EUR result ──────────────────────── */}
          <div className="flex-shrink-0 min-w-[180px]">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-0.5">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-foreground tracking-tight leading-none tabular-nums">
                {fmtInt(benchmark.hauptpot_net_euro)}
              </p>
              <span className="text-sm font-semibold text-muted-foreground">
                EUR
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                  isAbove
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {isAbove ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {isAbove ? "+" : ""}
                {fmtPct(Math.abs(diffPct))}
              </span>
            </div>
            <div className="mt-2 space-y-0.5 text-[11px]">
              <div className="flex items-center justify-between gap-4 tabular-nums">
                <span className="text-muted-foreground/70">Einsparung</span>
                <span className="text-muted-foreground">
                  {fmtInt(Math.round(benchmark.hauptpot_brut_euro))} EUR
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 tabular-nums">
                <span className="text-red-400/60">Erlosverluste</span>
                <span className="text-red-400/80">
                  -{fmtInt(Math.round(benchmark.erlosverlust_euro))} EUR
                </span>
              </div>
            </div>
          </div>

          {/* ── Divider ────────────────────────────────────── */}
          <div className="hidden lg:block w-px self-stretch bg-border" />

          {/* ── CENTER: 4 clickable sub-benchmark tiles ───── */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
              Potenzial-Hebel
            </p>
            <div className="grid grid-cols-4 gap-2">
              {SUB_KEYS.map((key) => {
                const sub = benchmark[key];
                const meta = SUB_META[key];
                const Icon = meta.icon;
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setOpenSub(key)}
                        className="group relative rounded-xl border bg-card px-3 py-2.5 text-left transition-all hover:shadow-md hover:border-foreground/20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {/* Colored top accent line */}
                        <div
                          className="absolute top-0 left-3 right-3 h-[2px] rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon
                            className="h-3 w-3 flex-shrink-0"
                            style={{ color: meta.color }}
                          />
                          <span className="text-[10px] text-muted-foreground truncate">
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span
                            className="text-lg font-bold leading-none tabular-nums"
                            style={{ color: meta.color }}
                          >
                            {fmtPct(sub.pct)}
                          </span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="mt-1.5 h-1 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(sub.pct, 100)}%`,
                              backgroundColor: meta.color,
                            }}
                          />
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="bg-card text-foreground border shadow-lg p-3 max-w-[200px]"
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {meta.desc}
                      </p>
                      <p className="text-xs font-semibold">
                        {fmtInt(sub.analysen)} einsparbare Analysen
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Klicken fur Details
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* ── Divider ────────────────────────────────────── */}
          <div className="hidden lg:block w-px self-stretch bg-border" />

          {/* ── RIGHT: Analysen/Fall comparison + stats ───── */}
          <div className="flex-shrink-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
              Analysen pro Fall
            </p>
            <div className="flex items-start gap-4">
              {/* Grid table: rows = Analysen, Falle, A/F | cols = label, Kunde, Benchmark */}
              <div className="grid grid-cols-[auto_auto_auto] gap-x-4 gap-y-0.5 items-baseline">
                {/* Header row */}
                <div />
                <span className="text-[10px] text-muted-foreground text-right">Kunde</span>
                <span className="text-[10px] text-muted-foreground text-right">Benchmark</span>

                {/* Analysen */}
                <span className="text-[10px] text-muted-foreground">Analysen</span>
                <span className="text-[11px] tabular-nums text-foreground text-right">{fmtInt(benchmark.total_analysen)}</span>
                <span className="text-[11px] tabular-nums text-primary/70 text-right">{fmtInt(Math.round(benchmark.benchmark_analysen))}</span>

                {/* Falle */}
                <span className="text-[10px] text-muted-foreground">Falle</span>
                <span className="text-[11px] tabular-nums text-foreground text-right">{fmtInt(benchmark.total_faelle)}</span>
                <span className="text-[11px] tabular-nums text-primary/70 text-right">{fmtInt(benchmark.total_faelle)}</span>

                {/* Divider spanning all cols */}
                <div className="col-span-3 border-t border-border my-0.5" />

                {/* A/F big row */}
                <span className="text-[10px] font-medium text-muted-foreground">A / F</span>
                <span className="text-base font-bold tabular-nums text-foreground text-right">{fmtDe(benchmark.analysen_pro_fall_kunde)}</span>
                <span className="text-base font-bold tabular-nums text-primary text-right">{fmtDe(benchmark.analysen_pro_fall_benchmark)}</span>
              </div>

              {/* Divider */}
              <div className="h-14 w-px bg-border flex-shrink-0 mt-3" />

              {/* Einsparung */}
              <div className="mt-3">
                <p className="text-[10px] text-muted-foreground">Einsparung</p>
                <p className="text-sm font-bold text-primary tabular-nums leading-tight mt-0.5">
                  {fmtInt(benchmark.hauptpot_net_analysen)} Analysen
                </p>
                <p className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                  {benchmark.total_analysen > 0
                    ? fmtPct((benchmark.hauptpot_net_analysen / benchmark.total_analysen) * 100)
                    : "0%"} der Gesamtanalysen
                </p>
              </div>
            </div>
          </div>

          {/* ── Divider ────────────────────────────────────── */}
          <div className="hidden lg:block w-px self-stretch bg-border" />

          {/* ── FAR RIGHT: Org Unit Donut ──────────────────── */}
          <div className="flex-shrink-0 w-fit">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
              Organisationseinheit
            </p>
            <div className="flex items-center gap-3">
              {/* Donut */}
              <div className="h-[85px] w-[85px] flex-shrink-0" key={donutKey}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={benchmark.orgUnits}
                      cx="50%"
                      cy="50%"
                      innerRadius={24}
                      outerRadius={38}
                      paddingAngle={3}
                      dataKey="pct"
                      nameKey="name"
                      stroke="none"
                      animationBegin={0}
                      animationDuration={600}
                      animationEasing="ease-out"
                    >
                      {benchmark.orgUnits.map((_, i) => (
                        <Cell key={i} fill={ORG_COLORS[i % ORG_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend beside donut - grid for alignment */}
              <div className="grid grid-cols-[auto_1fr_auto] gap-x-2 gap-y-1.5 items-center whitespace-nowrap">
                {benchmark.orgUnits.map((ou, i) => (
                  <React.Fragment key={ou.name}>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-2 w-2 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: ORG_COLORS[i] }}
                      />
                      <span className="text-[11px] text-muted-foreground">{ou.name}</span>
                    </div>
                    <div />
                    <span className="text-[11px] tabular-nums text-right">
                      <span className="font-semibold text-foreground">{fmtInt(Math.round(ou.euro))} EUR</span>
                      <span className="text-muted-foreground font-normal ml-1">({Math.round(ou.pct)}%)</span>
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail Dialog ──────────────────────────────────── */}
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
        <div className="flex gap-1">
          {SUB_KEYS.map((k) => (
            <button
              type="button"
              key={k}
              onClick={() => onNavigate(k)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                k === subKey ? "w-4" : "w-1.5"
              }`}
              style={{
                backgroundColor:
                  k === subKey ? SUB_META[k].color : "hsl(var(--border))",
              }}
              aria-label={SUB_META[k].label}
            />
          ))}
        </div>
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
