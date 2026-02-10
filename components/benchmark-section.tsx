"use client";

import type { AggregatedBenchmark } from "@/lib/benchmark-data";
import {
  ArrowDown,
  ArrowUp,
  Activity,
  Repeat2,
  Clock,
  Timer,
  TrendingDown,
  FlaskConical,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from "recharts";

const fmtDe = (n: number, dec = 2) =>
  n.toLocaleString("de-DE", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });

const fmtPct = (n: number) => `${Math.round(n)}%`;

const fmtInt = (n: number) => Math.round(n).toLocaleString("de-DE");

interface Props {
  benchmark: AggregatedBenchmark;
  title: string;
}

const SUB_META = {
  indikation: {
    color: "#3b82f6",
    icon: Activity,
    label: "Indikation",
    desc: "Erstanforderung in zu vielen Fallen?",
    unit: "%",
  },
  multiCaseRate: {
    color: "#f59e0b",
    icon: Repeat2,
    label: "MultiCaseRate",
    desc: "Zu viele Falle ins Monitoring?",
    unit: "%",
  },
  frequenz: {
    color: "#10b981",
    icon: Clock,
    label: "Frequenz",
    desc: "Zu haufige Anforderung?",
    unit: "Tage",
  },
  monitorZeit: {
    color: "#8b5cf6",
    icon: Timer,
    label: "Monitorzeit",
    desc: "Zu langer Monitoringzeitraum?",
    unit: "Tage",
  },
} as const;

const SUB_KEYS = ["indikation", "multiCaseRate", "frequenz", "monitorZeit"] as const;

export default function BenchmarkSection({ benchmark, title }: Props) {
  const diff =
    benchmark.analysen_pro_fall_kunde - benchmark.analysen_pro_fall_benchmark;
  const diffPct =
    benchmark.analysen_pro_fall_benchmark > 0
      ? (diff / benchmark.analysen_pro_fall_benchmark) * 100
      : 0;
  const isAbove = diff > 0;

  // Gauge
  const gaugeMax = benchmark.analysen_pro_fall_benchmark * 2;
  const gaugePct =
    gaugeMax > 0
      ? Math.min(
          (benchmark.analysen_pro_fall_kunde / gaugeMax) * 100,
          100,
        )
      : 50;
  const benchmarkLinePct =
    gaugeMax > 0
      ? Math.min(
          (benchmark.analysen_pro_fall_benchmark / gaugeMax) * 100,
          100,
        )
      : 50;

  // Donut data
  const pieData = SUB_KEYS.map((key) => ({
    name: SUB_META[key].label,
    value: benchmark[key].pct,
    color: SUB_META[key].color,
  })).filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* ── Main Benchmark Hero ──────────────────────────────────────── */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        {/* Dark header */}
        <div className="bg-foreground px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-background">
                Hauptbenchmark: Analysen pro Fall
              </h2>
              <p className="text-sm text-background/60">{title}</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
              isAbove
                ? "bg-destructive/20 text-destructive"
                : "bg-primary/20 text-primary"
            }`}
          >
            {isAbove ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            {fmtPct(Math.abs(diffPct))} vs. Benchmark
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left: Kunde */}
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Ihre Einrichtung
              </p>
              <p className="text-5xl font-bold text-foreground tracking-tight">
                {fmtDe(benchmark.analysen_pro_fall_kunde)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Analysen / Fall
              </p>
            </div>

            {/* Center: Gauge */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-full max-w-sm">
                <div className="relative h-8 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{
                      width: `${gaugePct}%`,
                      background: isAbove
                        ? "linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--destructive) / 0.7))"
                        : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))",
                    }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10"
                    style={{ left: `${benchmarkLinePct}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-foreground bg-card px-1.5 py-0.5 rounded border shadow-sm">
                      BM: {fmtDe(benchmark.analysen_pro_fall_benchmark)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                  <span>0</span>
                  <span>{fmtDe(gaugeMax, 1)}</span>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${
                  isAbove
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-primary/30 bg-primary/5"
                }`}
              >
                <TrendingDown
                  className={`h-4 w-4 ${isAbove ? "text-destructive rotate-180" : "text-primary"}`}
                />
                <span className="text-sm font-medium text-foreground">
                  Differenz:{" "}
                  <strong>
                    {isAbove ? "+" : ""}
                    {fmtDe(diff)}
                  </strong>{" "}
                  Analysen/Fall
                </span>
              </div>
            </div>

            {/* Right: Benchmark */}
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Benchmark
              </p>
              <p className="text-5xl font-bold text-primary tracking-tight">
                {fmtDe(benchmark.analysen_pro_fall_benchmark)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Analysen / Fall
              </p>
            </div>
          </div>

          {/* Summary strip */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniStat
              label="Netto-Potenzial"
              value={`${fmtInt(benchmark.hauptpot_net_analysen)} Analysen`}
              sub={`ca. ${fmtInt(benchmark.hauptpot_net_euro)} EUR`}
              accent="primary"
            />
            <MiniStat
              label="Gesamtanalysen"
              value={fmtInt(benchmark.total_analysen)}
              sub="aktuell"
            />
            <MiniStat
              label="Gesamtfalle"
              value={fmtInt(benchmark.total_faelle)}
              sub="im Zeitraum"
            />
            <MiniStat
              label="Einsparquote"
              value={fmtPct(
                benchmark.total_analysen > 0
                  ? (benchmark.hauptpot_net_analysen /
                      benchmark.total_analysen) *
                      100
                  : 0,
              )}
              sub="der Analysen"
              accent="primary"
            />
          </div>
        </div>
      </div>

      {/* ── Sub-Benchmarks — single unified card ─────────────────────── */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        {/* Section header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Potenzialaufschlusselung
            </h3>
            <p className="text-xs text-muted-foreground">
              Wie verteilt sich das Einsparpotenzial auf die 4 Sub-Benchmarks?
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Gesamtpotenzial</p>
            <p className="text-lg font-bold text-primary">
              {fmtInt(benchmark.hauptpot_net_analysen)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                Analysen
              </span>
            </p>
          </div>
        </div>

        {/* Content: donut on left, 4 sub-benchmarks on right */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-start">
            {/* Left: Donut chart */}
            <div className="flex flex-col items-center">
              <p className="text-xs font-medium text-muted-foreground mb-3">
                Hebelverteilung
              </p>
              <div className="w-full" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ReTooltip
                      formatter={(value: number) => [
                        `${Math.round(value)}%`,
                        "",
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
                {SUB_KEYS.map((key) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: SUB_META[key].color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {SUB_META[key].label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 4 sub-benchmark columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {SUB_KEYS.map((key) => {
                const sub = benchmark[key];
                const meta = SUB_META[key];
                const Icon = meta.icon;
                const isWorse =
                  key === "frequenz" || key === "monitorZeit"
                    ? sub.kunde < sub.benchmark
                    : sub.kunde > sub.benchmark;

                return (
                  <div
                    key={key}
                    className="rounded-xl border bg-secondary/30 p-4 flex flex-col justify-between"
                  >
                    {/* Top: Icon + Label */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="p-1.5 rounded-lg"
                          style={{ backgroundColor: `${meta.color}15` }}
                        >
                          <Icon
                            className="h-4 w-4"
                            style={{ color: meta.color }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {meta.label}
                        </span>
                      </div>

                      {/* Percentage share */}
                      <div className="mb-3">
                        <div className="flex items-end justify-between mb-1">
                          <span className="text-2xl font-bold text-foreground">
                            {fmtPct(sub.pct)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Anteil
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(sub.pct, 100)}%`,
                              backgroundColor: meta.color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Einsparbare Analysen */}
                      <div className="bg-card rounded-lg px-3 py-2 mb-3 border">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-muted-foreground">
                            Einsparbar
                          </span>
                          <span className="text-sm font-semibold text-foreground">
                            {fmtInt(sub.analysen)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Kunde vs Benchmark comparison */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          Kunde
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color: isWorse
                              ? "hsl(var(--destructive))"
                              : "hsl(var(--primary))",
                          }}
                        >
                          {fmtDe(sub.kunde)} {meta.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          Benchmark
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {fmtDe(sub.benchmark)} {meta.unit}
                        </span>
                      </div>
                      {/* Mini bars */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-muted-foreground w-5">
                            K
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(
                                  (sub.kunde /
                                    Math.max(sub.kunde, sub.benchmark, 1)) *
                                    100,
                                  100,
                                )}%`,
                                backgroundColor: isWorse
                                  ? "hsl(var(--destructive))"
                                  : meta.color,
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-muted-foreground w-5">
                            BM
                          </span>
                          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-foreground/40"
                              style={{
                                width: `${Math.min(
                                  (sub.benchmark /
                                    Math.max(sub.kunde, sub.benchmark, 1)) *
                                    100,
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-[9px] text-muted-foreground leading-tight italic pt-1">
                        {meta.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "primary" | "destructive";
}) {
  return (
    <div className="bg-secondary/50 rounded-xl px-4 py-3">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p
        className={`text-lg font-bold ${
          accent === "primary"
            ? "text-primary"
            : accent === "destructive"
              ? "text-destructive"
              : "text-foreground"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
