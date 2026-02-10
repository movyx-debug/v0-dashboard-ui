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

const fmtInt = (n: number) =>
  Math.round(n).toLocaleString("de-DE");

interface Props {
  benchmark: AggregatedBenchmark;
  title: string;
}

const SUB_COLORS = {
  indikation: "#3b82f6",   // blue
  multiCaseRate: "#f59e0b", // amber
  frequenz: "#10b981",      // emerald
  monitorZeit: "#8b5cf6",   // violet
};

const SUB_ICONS = {
  indikation: Activity,
  multiCaseRate: Repeat2,
  frequenz: Clock,
  monitorZeit: Timer,
};

const SUB_LABELS = {
  indikation: "Indikation",
  multiCaseRate: "MultiCaseRate",
  frequenz: "Frequenz",
  monitorZeit: "Monitorzeit",
};

const SUB_DESCRIPTIONS = {
  indikation: "Wird der Parameter in zu vielen Fallen erstmalig angefordert?",
  multiCaseRate: "Werden zu viele Falle in ein Monitoring uberfuhrt?",
  frequenz: "Wird innerhalb von Monitoring-Fallen zu haufig angefordert?",
  monitorZeit: "Wird uber einen zu langen Zeitraum monitoriert?",
};

const SUB_UNITS = {
  indikation: "%",
  multiCaseRate: "%",
  frequenz: "Tage",
  monitorZeit: "Tage",
};

export default function BenchmarkSection({ benchmark, title }: Props) {
  const diff = benchmark.analysen_pro_fall_kunde - benchmark.analysen_pro_fall_benchmark;
  const diffPct =
    benchmark.analysen_pro_fall_benchmark > 0
      ? (diff / benchmark.analysen_pro_fall_benchmark) * 100
      : 0;
  const isAbove = diff > 0;

  // Build pie data
  const pieData = [
    { name: "Indikation", value: benchmark.indikation.pct, color: SUB_COLORS.indikation },
    { name: "MultiCaseRate", value: benchmark.multiCaseRate.pct, color: SUB_COLORS.multiCaseRate },
    { name: "Frequenz", value: benchmark.frequenz.pct, color: SUB_COLORS.frequenz },
    { name: "Monitorzeit", value: benchmark.monitorZeit.pct, color: SUB_COLORS.monitorZeit },
  ].filter((d) => d.value > 0);

  const subKeys = ["indikation", "multiCaseRate", "frequenz", "monitorZeit"] as const;

  // Gauge percentage: how far above benchmark (capped at 200% for display)
  const gaugeMax = benchmark.analysen_pro_fall_benchmark * 2;
  const gaugePct = gaugeMax > 0
    ? Math.min((benchmark.analysen_pro_fall_kunde / gaugeMax) * 100, 100)
    : 50;
  const benchmarkLinePct = gaugeMax > 0
    ? Math.min((benchmark.analysen_pro_fall_benchmark / gaugeMax) * 100, 100)
    : 50;

  return (
    <div className="space-y-6">
      {/* ── Main Benchmark Hero ─────────────────────────────────────────── */}
      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        {/* Header bar */}
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
          <div className="flex items-center gap-2">
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
        </div>

        {/* Main content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left: Kunde value */}
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Ihre Einrichtung</p>
              <p className="text-5xl font-bold text-foreground tracking-tight">
                {fmtDe(benchmark.analysen_pro_fall_kunde)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Analysen / Fall</p>
            </div>

            {/* Center: Visual comparison gauge */}
            <div className="flex flex-col items-center gap-4">
              {/* Horizontal gauge */}
              <div className="w-full max-w-sm">
                <div className="relative h-8 rounded-full bg-secondary overflow-hidden">
                  {/* Kunde bar */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    style={{
                      width: `${gaugePct}%`,
                      background: isAbove
                        ? "linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--destructive) / 0.7))"
                        : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))",
                    }}
                  />
                  {/* Benchmark marker */}
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

              {/* Delta display */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${
                isAbove ? "border-destructive/30 bg-destructive/5" : "border-primary/30 bg-primary/5"
              }`}>
                <TrendingDown className={`h-4 w-4 ${isAbove ? "text-destructive rotate-180" : "text-primary"}`} />
                <span className="text-sm font-medium text-foreground">
                  Differenz: <strong>{isAbove ? "+" : ""}{fmtDe(diff)}</strong> Analysen/Fall
                </span>
              </div>
            </div>

            {/* Right: Benchmark value */}
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Benchmark</p>
              <p className="text-5xl font-bold text-primary tracking-tight">
                {fmtDe(benchmark.analysen_pro_fall_benchmark)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Analysen / Fall</p>
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
                  ? (benchmark.hauptpot_net_analysen / benchmark.total_analysen) * 100
                  : 0
              )}
              sub="der Analysen"
              accent="primary"
            />
          </div>
        </div>
      </div>

      {/* ── Sub-Benchmarks ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pie Chart - Hebel distribution */}
        <div className="lg:col-span-1 bg-card border rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-foreground mb-1 text-center">
            Hebelverteilung
          </h3>
          <p className="text-xs text-muted-foreground mb-4 text-center">
            Woher kommt das Potenzial?
          </p>
          <div className="w-full" style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <ReTooltip
                  formatter={(value: number) => [`${Math.round(value)}%`, ""]}
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
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-xs text-muted-foreground truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-Benchmark Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subKeys.map((key) => {
            const sub = benchmark[key];
            const Icon = SUB_ICONS[key];
            const color = SUB_COLORS[key];
            const label = SUB_LABELS[key];
            const desc = SUB_DESCRIPTIONS[key];
            const unit = SUB_UNITS[key];
            const isWorse =
              key === "frequenz" || key === "monitorZeit"
                ? sub.kunde < sub.benchmark // Lower interval = worse (more frequent)
                : sub.kunde > sub.benchmark;

            return (
              <div
                key={key}
                className="bg-card border rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                {/* Top */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="p-1.5 rounded-lg"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                  </div>

                  {/* Percentage bar */}
                  <div className="mb-3">
                    <div className="flex items-end justify-between mb-1">
                      <span className="text-2xl font-bold text-foreground">
                        {fmtPct(sub.pct)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Anteil am Potenzial
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(sub.pct, 100)}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Einsparbare Analysen */}
                  <div className="bg-secondary/60 rounded-lg px-3 py-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Einsparbare Analysen
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
                    <span className="text-xs text-muted-foreground">Kunde</span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: isWorse ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}
                    >
                      {fmtDe(sub.kunde)} {unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Benchmark</span>
                    <span className="text-xs font-semibold text-foreground">
                      {fmtDe(sub.benchmark)} {unit}
                    </span>
                  </div>
                  {/* Mini comparison bars */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-6">K</span>
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              (sub.kunde / Math.max(sub.kunde, sub.benchmark, 1)) * 100,
                              100
                            )}%`,
                            backgroundColor: isWorse ? "hsl(var(--destructive))" : color,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-6">BM</span>
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-foreground/40"
                          style={{
                            width: `${Math.min(
                              (sub.benchmark / Math.max(sub.kunde, sub.benchmark, 1)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer description */}
                <p className="text-[10px] text-muted-foreground mt-3 leading-tight italic">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Mini stat card ───────────────────────────────────────────────────────────

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
      {sub && (
        <p className="text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}
