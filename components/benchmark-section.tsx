"use client";

import React, { useState } from "react";
import type { AggregatedBenchmark, PatientenPhase, SubBenchmark } from "@/lib/benchmark-data";
import {
  Activity,
  Repeat2,
  Clock,
  Timer,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Layers,
} from "lucide-react";
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

// 2 Haupthebel
const HAUPT_META = {
  indikation: {
    color: "#5b8ab5",
    bgLight: "rgba(91,138,181,0.08)",
    icon: Activity,
    label: "Indikation",
    desc: "Anteil der Falle mit initialer Laboranforderung",
    longDesc:
      "Anteil der stationaren Falle, bei denen mindestens eine Laboranforderung erfolgt ist. Ein hoherer Wert als der Benchmark deutet auf haufigere Routineanforderungen hin.",
    unit: "%",
  },
  intensitaet: {
    color: "#cf8a3e",
    bgLight: "rgba(207,138,62,0.08)",
    icon: Layers,
    label: "Intensitat",
    desc: "Anforderungen pro indiziertem Fall",
    longDesc:
      "Anzahl der Laboranalysen pro indiziertem Fall. Setzt sich zusammen aus Monitorfallrate, Frequenz und Monitorzeit.",
    unit: "A/F",
  },
} as const;

// Sub-Hebel der Intensitat - Orange/Gelb/Braun Palette
const INTENSITAET_SUB_META = {
  multiCaseRate: {
    color: "#d97706", // amber-600
    bgLight: "rgba(217,119,6,0.08)",
    icon: Repeat2,
    label: "Monitorfallrate",
    desc: "Gehen zu viele Falle ins Monitoring?",
    longDesc:
      "Anteil der indizierten Falle mit Mehrfachanforderungen. Ein hoherer Wert bedeutet, dass mehr Patienten ins Monitoring gehen als vergleichbare Hauser.",
    unit: "%",
  },
  frequenz: {
    color: "#ca8a04", // yellow-600
    bgLight: "rgba(202,138,4,0.08)",
    icon: Clock,
    label: "Frequenz",
    desc: "Wird der Parameter zu haufig nachbestellt?",
    longDesc:
      "Mittlere Zeit zwischen zwei Anforderungen. Ein niedrigerer Wert als der Benchmark bedeutet haufigere Nachbestellungen.",
    unit: "Tage",
  },
  monitorZeit: {
    color: "#92400e", // amber-800 (braun)
    bgLight: "rgba(146,64,14,0.08)",
    icon: Timer,
    label: "Monitorzeit",
    desc: "Dauert das Monitoring zu lange?",
    longDesc:
      "Zeitraum, uber den ein Monitoring bzw. Mehrfachanforderungen im Schnitt durchgefuhrt werden. Ein hoherer Wert deutet auf langeres Monitoring hin.",
    unit: "Tage",
  },
} as const;

type HauptKey = keyof typeof HAUPT_META;
type IntensitaetSubKey = keyof typeof INTENSITAET_SUB_META;
const HAUPT_KEYS: HauptKey[] = ["indikation", "intensitaet"];
const INTENSITAET_SUB_KEYS: IntensitaetSubKey[] = ["multiCaseRate", "frequenz", "monitorZeit"];

const PHASE_COLORS = ["#4a7fad", "#5b8ab5", "#8bb0d0"]; // Aufnahme (dark), Verlauf (mid), Entlass (light)

interface Props {
  benchmark: AggregatedBenchmark;
  title: string;
}



export default function BenchmarkSection({ benchmark, title }: Props) {
  const [activeHaupt, setActiveHaupt] = useState<HauptKey | null>(null);
  const [activeSubHebel, setActiveSubHebel] = useState<IntensitaetSubKey | null>(null);

  const diff =
    benchmark.analysen_pro_fall_kunde - benchmark.analysen_pro_fall_benchmark;
  const diffPct =
    benchmark.analysen_pro_fall_benchmark > 0
      ? (diff / benchmark.analysen_pro_fall_benchmark) * 100
      : 0;
  const isAbove = diff > 0;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-0">
        {/* Horizontal cockpit row - separate tiles with gap */}
        <div className="flex gap-3 items-stretch">
          {/* ── Section 1: Netto Einsparpotenzial ──────────────────────── */}
          <div className="bg-card border rounded-xl px-5 py-4 flex flex-col min-w-[200px]">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
              {title}
            </p>
            <div className="flex-1 flex flex-col justify-center">
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
              <div className="mt-1.5 space-y-0 text-[10px] tabular-nums">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground/70">Brutto</span>
                  <span className="text-muted-foreground">{fmtInt(Math.round(benchmark.hauptpot_brut_euro))} EUR</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-red-400/60">Erlosverluste</span>
                  <span className="text-red-400/80">-{fmtInt(Math.round(benchmark.erlosverlust_euro))} EUR</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-primary/70">Analysen</span>
                  <span className="text-primary">{fmtInt(benchmark.hauptpot_net_analysen)} ({benchmark.total_analysen > 0 ? fmtPct((benchmark.hauptpot_net_analysen / benchmark.total_analysen) * 100) : "0%"})</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 2: Potenzial-Hebel ───── */}
          <div className="bg-card border rounded-xl px-5 py-4 flex flex-col">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
              Potenzial-Hebel / Anteil am Potenzial
            </p>
            <div className="flex-1 flex items-center">
            
            <div className="flex gap-3">
              {/* Indikation tile */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveHaupt(activeHaupt === "indikation" ? null : "indikation");
                      setActiveSubHebel(null);
                    }}
                    className={`group relative rounded-xl border px-4 py-3 text-left transition-all cursor-pointer focus:outline-none min-w-[120px] ${
                      activeHaupt === "indikation" 
                        ? "ring-2 ring-offset-2 shadow-md" 
                        : "bg-card hover:shadow-md"
                    }`}
                    style={{
                      borderColor: activeHaupt === "indikation" ? HAUPT_META.indikation.color : undefined,
                      backgroundColor: activeHaupt === "indikation" ? `${HAUPT_META.indikation.color}12` : undefined,
                      // @ts-expect-error CSS custom property
                      "--tw-ring-color": HAUPT_META.indikation.color,
                    }}
                    onMouseEnter={(e) => {
                      if (activeHaupt !== "indikation") {
                        e.currentTarget.style.backgroundColor = `${HAUPT_META.indikation.color}08`;
                        e.currentTarget.style.borderColor = `${HAUPT_META.indikation.color}50`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeHaupt !== "indikation") {
                        e.currentTarget.style.backgroundColor = "";
                        e.currentTarget.style.borderColor = "";
                      }
                    }}
                  >
                    <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full" style={{ backgroundColor: HAUPT_META.indikation.color }} />
                    <div className="flex items-center gap-1.5 mb-1">
                      <Activity className="h-3.5 w-3.5 flex-shrink-0" style={{ color: HAUPT_META.indikation.color }} />
                      <span className={`text-[11px] ${activeHaupt === "indikation" ? "text-foreground font-medium" : "text-muted-foreground"}`}>Indikation</span>
                    </div>
                    <span className="text-xl font-bold tabular-nums" style={{ color: HAUPT_META.indikation.color }}>
                      {fmtPct(benchmark.indikation.pct)}
                    </span>
                    <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(benchmark.indikation.pct, 100)}%`, backgroundColor: HAUPT_META.indikation.color }} />
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-card text-foreground border shadow-lg p-2.5 max-w-[200px]">
                  <p className="text-xs text-muted-foreground">{HAUPT_META.indikation.desc}</p>
                </TooltipContent>
              </Tooltip>

              {/* Intensitat group (Haupthebel + 3 Sub-Hebel rechts daneben) */}
              <div className="flex items-stretch gap-1.5">
                {/* Intensitat main tile */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        // Wenn Sub-Hebel aktiv: Sub-Hebel deaktivieren, Intensitaet bleibt aktiv
                        if (activeSubHebel) {
                          setActiveSubHebel(null);
                        } else if (activeHaupt === "intensitaet") {
                          // Wenn nur Intensitaet aktiv (ohne Sub-Hebel): alles deaktivieren
                          setActiveHaupt(null);
                        } else {
                          // Wenn nichts oder Indikation aktiv: Intensitaet aktivieren
                          setActiveHaupt("intensitaet");
                          setActiveSubHebel(null);
                        }
                      }}
                      className={`group relative rounded-xl border px-4 py-3 text-left transition-all cursor-pointer focus:outline-none min-w-[120px] ${
                        activeHaupt === "intensitaet" && !activeSubHebel
                          ? "ring-2 ring-offset-2 shadow-md" 
                          : "bg-card hover:shadow-md"
                      }`}
                      style={{
                        borderColor: activeHaupt === "intensitaet" && !activeSubHebel ? HAUPT_META.intensitaet.color : undefined,
                        backgroundColor: activeHaupt === "intensitaet" && !activeSubHebel ? `${HAUPT_META.intensitaet.color}12` : undefined,
                        // @ts-expect-error CSS custom property
                        "--tw-ring-color": HAUPT_META.intensitaet.color,
                      }}
                      onMouseEnter={(e) => {
                        if (!(activeHaupt === "intensitaet" && !activeSubHebel)) {
                          e.currentTarget.style.backgroundColor = `${HAUPT_META.intensitaet.color}08`;
                          e.currentTarget.style.borderColor = `${HAUPT_META.intensitaet.color}50`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!(activeHaupt === "intensitaet" && !activeSubHebel)) {
                          e.currentTarget.style.backgroundColor = "";
                          e.currentTarget.style.borderColor = "";
                        }
                      }}
                    >
                      <div className="absolute top-0 left-3 right-3 h-[2px] rounded-full" style={{ backgroundColor: HAUPT_META.intensitaet.color }} />
                      <div className="flex items-center gap-1.5 mb-1">
                        <Layers className="h-3.5 w-3.5 flex-shrink-0" style={{ color: HAUPT_META.intensitaet.color }} />
                        <span className={`text-[11px] ${activeHaupt === "intensitaet" && !activeSubHebel ? "text-foreground font-medium" : "text-muted-foreground"}`}>Intensitat</span>
                      </div>
                      <span className="text-xl font-bold tabular-nums" style={{ color: HAUPT_META.intensitaet.color }}>
                        {fmtPct(benchmark.intensitaet.pct)}
                      </span>
                      <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(benchmark.intensitaet.pct, 100)}%`, backgroundColor: HAUPT_META.intensitaet.color }} />
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-card text-foreground border shadow-lg p-2.5 max-w-[200px]">
                    <p className="text-xs text-muted-foreground">{HAUPT_META.intensitaet.desc}</p>
                  </TooltipContent>
                </Tooltip>

                {/* 3 Sub-Hebel (stacked vertically, right of Intensitat) */}
                <div className="flex flex-col justify-center gap-1">
                  {INTENSITAET_SUB_KEYS.map((subKey) => {
                    const subHebel = benchmark.intensitaet.subHebel[subKey];
                    const subMeta = INTENSITAET_SUB_META[subKey];
                    const SubIcon = subMeta.icon;
                    const isActive = activeSubHebel === subKey;
                    return (
                      <Tooltip key={subKey}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveHaupt("intensitaet");
                              setActiveSubHebel(isActive ? null : subKey);
                            }}
                            className={`flex flex-col gap-0.5 px-2 py-1.5 rounded-lg border text-[10px] transition-all cursor-pointer min-w-[100px] ${
                              isActive 
                                ? "ring-1 ring-offset-1" 
                                : "bg-card text-muted-foreground"
                            }`}
                            style={{
                              backgroundColor: isActive ? `${subMeta.color}20` : undefined,
                              borderColor: isActive ? subMeta.color : undefined,
                              // @ts-expect-error CSS custom property
                              "--tw-ring-color": subMeta.color,
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.backgroundColor = `${subMeta.color}15`;
                                e.currentTarget.style.borderColor = `${subMeta.color}60`;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.backgroundColor = "";
                                e.currentTarget.style.borderColor = "";
                              }
                            }}
                          >
                            <div className="flex items-center justify-between gap-1.5 w-full">
                              <div className="flex items-center gap-1">
                                <SubIcon className="h-3 w-3 flex-shrink-0" style={{ color: subMeta.color }} />
                                <span className={`text-[9px] truncate ${isActive ? "font-medium" : ""}`} style={{ color: isActive ? subMeta.color : undefined }}>{subMeta.label}</span>
                              </div>
                              <span className="font-semibold tabular-nums" style={{ color: subMeta.color }}>{Math.round(subHebel.pct)}%</span>
                            </div>
                            <div className="h-1 rounded-full bg-secondary/60 overflow-hidden w-full">
                              <div className="h-full rounded-full" style={{ width: `${Math.min(subHebel.pct, 100)}%`, backgroundColor: subMeta.color }} />
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-card text-foreground border shadow-lg p-2 max-w-[180px]">
                          <p className="text-[11px] font-medium mb-0.5" style={{ color: subMeta.color }}>{subMeta.label}</p>
                          <p className="text-[10px] text-muted-foreground">{subMeta.desc}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* ── Section 3: Benchmarkvergleich ───── */}
          <div className="bg-card border rounded-xl px-5 py-4 flex flex-col flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
              Benchmarkvergleich
            </p>
            <div className="flex-1 flex flex-col justify-center">
            {/* Default: Analysen pro Fall */}
            {!activeHaupt && (() => {
              const diffVal = benchmark.analysen_pro_fall_kunde - benchmark.analysen_pro_fall_benchmark;
              const diffPctVal = benchmark.analysen_pro_fall_benchmark > 0 
                ? (diffVal / benchmark.analysen_pro_fall_benchmark) * 100 
                : 0;
              return (
                <div className="rounded-lg border-l-[3px] border-border/50 bg-muted/30 p-3 transition-all">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
                    Anforderungen pro Fall
                  </p>
                  {/* 4 Werte mit Labels - Grid gleichverteilt */}
                  <div className="grid grid-cols-4 gap-4 mb-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Ihr Wert</span>
                      <span className="text-base font-bold tabular-nums text-foreground">{fmtDe(benchmark.analysen_pro_fall_kunde)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Benchmark</span>
                      <span className="text-base font-bold tabular-nums text-primary">{fmtDe(benchmark.analysen_pro_fall_benchmark)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Abweichung</span>
                      <span className={`text-base font-bold tabular-nums ${diffVal > 0 ? "text-destructive" : "text-primary"}`}>
                        {diffVal > 0 ? "+" : ""}{fmtPct(diffPctVal)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Potenzial</span>
                      <span className="text-base font-bold tabular-nums text-primary whitespace-nowrap">
                        {fmtInt(benchmark.hauptpot_net_euro)} €
                      </span>
                      <span className="text-[9px] tabular-nums text-muted-foreground">
                        {fmtInt(benchmark.hauptpot_net_analysen)} A
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Anzahl der Laboranalysen pro stationarem Fall. Setzt sich zusammen aus <span className="font-medium text-foreground">Indikation</span> (Anteil Falle mit Laboranforderung) und <span className="font-medium text-foreground">Intensitat</span> (Analysen pro indiziertem Fall).
                  </p>
                </div>
              );
            })()}

            {/* Indikation selected */}
            {activeHaupt === "indikation" && (() => {
              const diffVal = benchmark.indikation.kunde - benchmark.indikation.benchmark;
              const diffPctVal = benchmark.indikation.benchmark > 0 
                ? (diffVal / benchmark.indikation.benchmark) * 100 
                : 0;
              // Euro berechnen: Anteil * Gesamt-Euro
              const euroVal = benchmark.hauptpot_net_euro * (benchmark.indikation.pct / 100);
              return (
                <div 
                  className="rounded-lg border-l-[3px] p-3 transition-all"
                  style={{ 
                    borderLeftColor: HAUPT_META.indikation.color,
                    backgroundColor: `${HAUPT_META.indikation.color}08`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4" style={{ color: HAUPT_META.indikation.color }} />
                    <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: HAUPT_META.indikation.color }}>
                      Indikation
                    </p>
                  </div>
                  {/* 4 Werte mit Labels - Grid gleichverteilt */}
                  <div className="grid grid-cols-4 gap-4 mb-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Ihr Wert</span>
                      <span className="text-base font-bold tabular-nums" style={{ color: diffVal > 0 ? "hsl(var(--destructive))" : "hsl(var(--foreground))" }}>
                        {fmtDe(benchmark.indikation.kunde)}%
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Benchmark</span>
                      <span className="text-base font-bold tabular-nums text-primary">{fmtDe(benchmark.indikation.benchmark)}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Abweichung</span>
                      <span className={`text-base font-bold tabular-nums ${diffVal > 0 ? "text-destructive" : "text-primary"}`}>
                        {diffVal > 0 ? "+" : ""}{fmtPct(diffPctVal)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Potenzial</span>
                      <span className="text-base font-bold tabular-nums text-primary whitespace-nowrap">
                        {fmtInt(euroVal)} €
                      </span>
                      <span className="text-[9px] tabular-nums text-muted-foreground">
                        {fmtInt(benchmark.indikation.analysen)} A
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {HAUPT_META.indikation.longDesc}
                  </p>
                </div>
              );
            })()}

            {/* Intensitat selected (no sub-hebel active) */}
            {activeHaupt === "intensitaet" && !activeSubHebel && (() => {
              const diffVal = benchmark.intensitaet.kunde - benchmark.intensitaet.benchmark;
              const diffPctVal = benchmark.intensitaet.benchmark > 0 
                ? (diffVal / benchmark.intensitaet.benchmark) * 100 
                : 0;
              // Euro berechnen: Anteil * Gesamt-Euro
              const euroVal = benchmark.hauptpot_net_euro * (benchmark.intensitaet.pct / 100);
              return (
                <div 
                  className="rounded-lg border-l-[3px] p-3 transition-all"
                  style={{ 
                    borderLeftColor: HAUPT_META.intensitaet.color,
                    backgroundColor: `${HAUPT_META.intensitaet.color}08`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-4 w-4" style={{ color: HAUPT_META.intensitaet.color }} />
                    <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: HAUPT_META.intensitaet.color }}>
                      Intensitat
                    </p>
                  </div>
                  {/* 4 Werte mit Labels - Grid gleichverteilt */}
                  <div className="grid grid-cols-4 gap-4 mb-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Ihr Wert</span>
                      <span className="text-base font-bold tabular-nums" style={{ color: diffVal > 0 ? "hsl(var(--destructive))" : "hsl(var(--foreground))" }}>
                        {fmtDe(benchmark.intensitaet.kunde)} <span className="text-[10px] font-normal text-muted-foreground">A/F</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Benchmark</span>
                      <span className="text-base font-bold tabular-nums text-primary">
                        {fmtDe(benchmark.intensitaet.benchmark)} <span className="text-[10px] font-normal text-muted-foreground">A/F</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Abweichung</span>
                      <span className={`text-base font-bold tabular-nums ${diffVal > 0 ? "text-destructive" : "text-primary"}`}>
                        {diffVal > 0 ? "+" : ""}{fmtPct(diffPctVal)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Potenzial</span>
                      <span className="text-base font-bold tabular-nums text-primary whitespace-nowrap">
                        {fmtInt(euroVal)} €
                      </span>
                      <span className="text-[9px] tabular-nums text-muted-foreground">
                        {fmtInt(benchmark.intensitaet.analysen)} A
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {HAUPT_META.intensitaet.longDesc}
                  </p>
                </div>
              );
            })()}

            {/* Sub-Hebel selected */}
            {activeSubHebel && (() => {
              const subData = benchmark.intensitaet.subHebel[activeSubHebel];
              const subMeta = INTENSITAET_SUB_META[activeSubHebel];
              const diffVal = subData.kunde - subData.benchmark;
              // Fuer Frequenz ist hoeher = besser (mehr Tage zwischen Anforderungen)
              // Fuer Monitorzeit ist niedriger = besser
              // Fuer Monitorfallrate ist niedriger = besser
              const isHigherBad = activeSubHebel !== "frequenz";
              const diffPctVal = subData.benchmark > 0 
                ? (diffVal / subData.benchmark) * 100 
                : 0;
              const showAsNegative = isHigherBad ? diffVal > 0 : diffVal < 0;
              // Euro berechnen: Sub-Hebel Anteil innerhalb Intensitaet * Intensitaet-Euro
              const intensitaetEuro = benchmark.hauptpot_net_euro * (benchmark.intensitaet.pct / 100);
              const euroVal = intensitaetEuro * (subData.pct / 100);
              return (
                <div 
                  className="rounded-lg border-l-[3px] p-3 transition-all"
                  style={{ 
                    borderLeftColor: subMeta.color,
                    backgroundColor: `${subMeta.color}08`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {React.createElement(subMeta.icon, {
                      className: "h-4 w-4",
                      style: { color: subMeta.color }
                    })}
                    <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: subMeta.color }}>
                      {subMeta.label}
                    </p>
                  </div>
                  {/* 4 Werte mit Labels - Grid gleichverteilt */}
                  <div className="grid grid-cols-4 gap-4 mb-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Ihr Wert</span>
                      <span className="text-base font-bold tabular-nums" style={{ color: showAsNegative ? "hsl(var(--destructive))" : "hsl(var(--foreground))" }}>
                        {fmtDe(subData.kunde)} <span className="text-[10px] font-normal text-muted-foreground">{subMeta.unit}</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Benchmark</span>
                      <span className="text-base font-bold tabular-nums text-primary">
                        {fmtDe(subData.benchmark)} <span className="text-[10px] font-normal text-muted-foreground">{subMeta.unit}</span>
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Abweichung</span>
                      <span className={`text-base font-bold tabular-nums ${showAsNegative ? "text-destructive" : "text-primary"}`}>
                        {diffVal > 0 ? "+" : ""}{fmtPct(diffPctVal)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Potenzial</span>
                      <span className="text-base font-bold tabular-nums text-primary whitespace-nowrap">
                        {fmtInt(euroVal)} €
                      </span>
                      <span className="text-[9px] tabular-nums text-muted-foreground">
                        {fmtInt(subData.analysen)} A
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {subMeta.longDesc}
                  </p>
                </div>
              );
            })()}
            </div>
          </div>

          {/* ── Section 4: Grundkennzahlen ───── */}
          <div className="bg-card border rounded-xl px-5 py-4 flex flex-col min-w-[180px]">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
              Grundkennzahlen
            </p>
            <div className="flex-1 flex flex-col justify-center">
              {/* Fälle + Analysen nebeneinander */}
              <div className="flex gap-4">
                {/* Fälle Spalte */}
                <div className="min-w-[90px]">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-1">Falle</p>
                  <div className="space-y-0.5 text-[10px] tabular-nums">
                    {/* Gesamt - highlight bei Indikation */}
                    <div 
                      className="flex justify-between gap-2 rounded px-1 -mx-1 transition-all"
                      style={{ backgroundColor: activeHaupt === "indikation" ? `${HAUPT_META.indikation.color}15` : "transparent" }}
                    >
                      <span className={activeHaupt === "indikation" ? "font-medium" : "text-muted-foreground"} style={{ color: activeHaupt === "indikation" ? HAUPT_META.indikation.color : undefined }}>Gesamt</span>
                      <span className={activeHaupt === "indikation" ? "font-semibold" : "text-foreground font-medium"} style={{ color: activeHaupt === "indikation" ? HAUPT_META.indikation.color : undefined }}>{fmtInt(benchmark.total_faelle)}</span>
                    </div>
                    {/* mit Labor - highlight bei Indikation, Intensität (ohne Sub), oder Monitorfallrate (multiCaseRate) */}
                    {(() => {
                      const highlightMitLabor = activeHaupt === "indikation" || (activeHaupt === "intensitaet" && !activeSubHebel) || activeSubHebel === "multiCaseRate";
                      const mitLaborColor = activeHaupt === "indikation" 
                        ? HAUPT_META.indikation.color 
                        : activeSubHebel === "multiCaseRate" 
                          ? INTENSITAET_SUB_META.multiCaseRate.color 
                          : HAUPT_META.intensitaet.color;
                      return (
                        <div 
                          className="flex justify-between gap-2 rounded px-1 -mx-1 transition-all"
                          style={{ backgroundColor: highlightMitLabor ? `${mitLaborColor}15` : "transparent" }}
                        >
                          <span 
                            className={highlightMitLabor ? "font-medium" : "text-muted-foreground"} 
                            style={{ color: highlightMitLabor ? mitLaborColor : undefined }}
                          >mit Labor</span>
                          <span 
                            className={highlightMitLabor ? "font-semibold" : "text-foreground font-medium"} 
                            style={{ color: highlightMitLabor ? mitLaborColor : undefined }}
                          >{fmtInt(benchmark.faelle_mit_labor)}</span>
                        </div>
                      );
                    })()}
                    {/* Mehrfach - highlight bei allen Sub-Hebeln */}
                    <div 
                      className="flex justify-between gap-2 rounded px-1 -mx-1 transition-all"
                      style={{ backgroundColor: activeSubHebel ? `${INTENSITAET_SUB_META[activeSubHebel].color}15` : "transparent" }}
                    >
                      <span className={activeSubHebel ? "font-medium" : "text-muted-foreground"} style={{ color: activeSubHebel ? INTENSITAET_SUB_META[activeSubHebel].color : undefined }}>Mehrfach</span>
                      <span className={activeSubHebel ? "font-semibold" : "text-foreground font-medium"} style={{ color: activeSubHebel ? INTENSITAET_SUB_META[activeSubHebel].color : undefined }}>{fmtInt(benchmark.faelle_mit_mehrfach)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Einzel</span>
                      <span className="text-foreground font-medium">{fmtInt(benchmark.faelle_mit_einzel)}</span>
                    </div>
                  </div>
                </div>

                {/* Analysen Spalte */}
                <div className="min-w-[90px]">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-1">Analysen</p>
                  <div className="space-y-0.5 text-[10px] tabular-nums">
                    {/* Platzhalter für Alignment mit Fälle Gesamt */}
                    <div className="flex justify-between gap-2 invisible"><span>-</span><span>-</span></div>
                    {/* Gesamt - auf Höhe von "mit Labor", highlight bei Intensität (ohne Sub) */}
                    <div 
                      className="flex justify-between gap-2 rounded px-1 -mx-1 transition-all"
                      style={{ backgroundColor: (activeHaupt === "intensitaet" && !activeSubHebel) ? `${HAUPT_META.intensitaet.color}15` : "transparent" }}
                    >
                      <span className={(activeHaupt === "intensitaet" && !activeSubHebel) ? "font-medium" : "text-muted-foreground"} style={{ color: (activeHaupt === "intensitaet" && !activeSubHebel) ? HAUPT_META.intensitaet.color : undefined }}>Gesamt</span>
                      <span className={(activeHaupt === "intensitaet" && !activeSubHebel) ? "font-semibold" : "text-foreground font-medium"} style={{ color: (activeHaupt === "intensitaet" && !activeSubHebel) ? HAUPT_META.intensitaet.color : undefined }}>{fmtInt(benchmark.total_analysen)}</span>
                    </div>
                    {/* Mehrfach - highlight bei Frequenz oder Monitorzeit */}
                    <div 
                      className="flex justify-between gap-2 rounded px-1 -mx-1 transition-all"
                      style={{ backgroundColor: (activeSubHebel === "frequenz" || activeSubHebel === "monitorZeit") ? `${INTENSITAET_SUB_META[activeSubHebel].color}15` : "transparent" }}
                    >
                      <span className={(activeSubHebel === "frequenz" || activeSubHebel === "monitorZeit") ? "font-medium" : "text-muted-foreground"} style={{ color: (activeSubHebel === "frequenz" || activeSubHebel === "monitorZeit") ? INTENSITAET_SUB_META[activeSubHebel].color : undefined }}>Mehrfach</span>
                      <span className={(activeSubHebel === "frequenz" || activeSubHebel === "monitorZeit") ? "font-semibold" : "text-foreground font-medium"} style={{ color: (activeSubHebel === "frequenz" || activeSubHebel === "monitorZeit") ? INTENSITAET_SUB_META[activeSubHebel].color : undefined }}>{fmtInt(benchmark.analysen_aus_mehrfach)}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Einzel</span>
                      <span className="text-foreground font-medium">{fmtInt(benchmark.analysen_aus_einzel)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benchmark darunter */}
              <div className="mt-2 pt-1.5 border-t border-border/30">
                <p className="text-[9px] uppercase tracking-wider text-primary/70 font-medium mb-0.5">Benchmark</p>
                <div className="flex gap-4 text-[10px] tabular-nums">
                  <div className="flex gap-1.5">
                    <span className="text-muted-foreground">Falle</span>
                    <span className="text-primary font-medium">{fmtInt(benchmark.benchmark_faelle)}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-muted-foreground">Projekte</span>
                    <span className="text-primary font-medium">{benchmark.benchmark_projekte}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}


