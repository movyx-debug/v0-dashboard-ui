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
      "Vergleich der Indikationsquote: In wie viel Prozent der Falle wird der Parameter initial angefordert? Ein hoherer Wert als der Benchmark kann darauf hindeuten, dass der Parameter bei zu vielen Patienten routinemassig bestellt wird.",
    unit: "%",
  },
  intensitaet: {
    color: "#cf8a3e",
    bgLight: "rgba(207,138,62,0.08)",
    icon: Layers,
    label: "Intensitat",
    desc: "Anforderungen pro indiziertem Fall",
    longDesc:
      "Die Intensitat beschreibt, wie viele Anforderungen pro indiziertem Fall erfolgen. Dieser Hebel setzt sich zusammen aus der Monitorfallrate (wie viele Falle ins Monitoring gehen), der Frequenz (wie haufig nachbestellt wird) und der Monitorzeit (wie lange das Monitoring dauert).",
    unit: "A/F",
  },
} as const;

// Sub-Hebel der Intensitat
const INTENSITAET_SUB_META = {
  multiCaseRate: {
    color: "#cb7b5a",
    bgLight: "rgba(203,123,90,0.08)",
    icon: Repeat2,
    label: "Monitorfallrate",
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

          {/* ── Divider ────────────────────────────────────── */}
          <div className="hidden lg:block w-px self-stretch bg-border" />

          {/* ── CENTER: Potenzial-Hebel (2 Haupt + 3 Sub unter Intensitat) ───── */}
          <div className="flex-shrink-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
              Potenzial-Hebel
            </p>
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
                <div className="flex flex-col justify-center gap-0.5">
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
                            className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] transition-all cursor-pointer ${
                              isActive 
                                ? "ring-1 ring-offset-1 font-semibold" 
                                : "bg-card text-muted-foreground"
                            }`}
                            style={{
                              backgroundColor: isActive ? `${subMeta.color}20` : undefined,
                              borderColor: isActive ? subMeta.color : undefined,
                              color: isActive ? subMeta.color : undefined,
                              // @ts-expect-error CSS custom property
                              "--tw-ring-color": subMeta.color,
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.backgroundColor = `${subMeta.color}15`;
                                e.currentTarget.style.borderColor = `${subMeta.color}60`;
                                e.currentTarget.style.color = subMeta.color;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.backgroundColor = "";
                                e.currentTarget.style.borderColor = "";
                                e.currentTarget.style.color = "";
                              }
                            }}
                          >
                            <SubIcon className="h-3 w-3" />
                            <span className="font-medium tabular-nums">{Math.round(subHebel.pct)}%</span>
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

          {/* ── Divider ────────────────────────────────────── */}
          <div className="hidden lg:block w-px self-stretch bg-border" />

          {/* ── RIGHT: Context-sensitive explanation area + Kennzahlen ───── */}
          <div className="flex-1 flex gap-4">
            {/* Erklaerungsbereich */}
            <div className="flex-1 min-w-[220px]">
            {/* Default: Analysen pro Fall */}
            {!activeHaupt && (
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3 transition-all">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1.5">
                  Analysen pro Fall
                </p>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-lg font-bold tabular-nums text-foreground">{fmtDe(benchmark.analysen_pro_fall_kunde)}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-lg font-bold tabular-nums text-primary">{fmtDe(benchmark.analysen_pro_fall_benchmark)}</span>
                  <span className="text-[10px] text-muted-foreground">(Benchmark)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Dieser Wert zeigt, wie viele Laboranalysen pro stationarem Fall durchgefuhrt werden. Er setzt sich zusammen aus der <span className="font-medium text-foreground">Indikation</span> (bei wie vielen Fallen wird uberhaupt Labor angefordert) und der <span className="font-medium text-foreground">Intensitat</span> (wie viele Anforderungen pro indiziertem Fall). Klicken Sie auf einen Hebel, um Details zu sehen.
                </p>
              </div>
            )}

            {/* Indikation selected */}
            {activeHaupt === "indikation" && (
              <div 
                className="rounded-lg border-l-[3px] p-3 transition-all"
                style={{ 
                  borderLeftColor: HAUPT_META.indikation.color,
                  backgroundColor: `${HAUPT_META.indikation.color}08`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Activity className="h-4 w-4" style={{ color: HAUPT_META.indikation.color }} />
                  <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: HAUPT_META.indikation.color }}>
                    Indikation
                  </p>
                </div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-base font-bold tabular-nums" style={{ color: benchmark.indikation.kunde > benchmark.indikation.benchmark ? "hsl(var(--destructive))" : "hsl(var(--foreground))" }}>
                    {fmtDe(benchmark.indikation.kunde)}%
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-base font-bold tabular-nums text-primary">{fmtDe(benchmark.indikation.benchmark)}%</span>
                  <span className="text-[10px] text-muted-foreground">(Benchmark)</span>
                  <span className="text-[10px] font-medium tabular-nums ml-auto" style={{ color: HAUPT_META.indikation.color }}>
                    {fmtInt(benchmark.indikation.analysen)} Analysen ({fmtPct(benchmark.indikation.pct)})
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {HAUPT_META.indikation.longDesc}
                </p>
              </div>
            )}

            {/* Intensitat selected (no sub-hebel active) */}
            {activeHaupt === "intensitaet" && !activeSubHebel && (
              <div 
                className="rounded-lg border-l-[3px] p-3 transition-all"
                style={{ 
                  borderLeftColor: HAUPT_META.intensitaet.color,
                  backgroundColor: `${HAUPT_META.intensitaet.color}08`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Layers className="h-4 w-4" style={{ color: HAUPT_META.intensitaet.color }} />
                  <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: HAUPT_META.intensitaet.color }}>
                    Intensitat
                  </p>
                </div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-base font-bold tabular-nums" style={{ color: benchmark.intensitaet.kunde > benchmark.intensitaet.benchmark ? "hsl(var(--destructive))" : "hsl(var(--foreground))" }}>
                    {fmtDe(benchmark.intensitaet.kunde)}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-base font-bold tabular-nums text-primary">{fmtDe(benchmark.intensitaet.benchmark)}</span>
                  <span className="text-[10px] text-muted-foreground">(Benchmark)</span>
                  <span className="text-[10px] font-medium tabular-nums ml-auto" style={{ color: HAUPT_META.intensitaet.color }}>
                    {fmtInt(benchmark.intensitaet.analysen)} Analysen ({fmtPct(benchmark.intensitaet.pct)})
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {HAUPT_META.intensitaet.longDesc}
                </p>
              </div>
            )}

            {/* Sub-Hebel selected */}
            {activeSubHebel && (
              <div 
                className="rounded-lg border-l-[3px] p-3 transition-all"
                style={{ 
                  borderLeftColor: INTENSITAET_SUB_META[activeSubHebel].color,
                  backgroundColor: `${INTENSITAET_SUB_META[activeSubHebel].color}08`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {React.createElement(INTENSITAET_SUB_META[activeSubHebel].icon, {
                    className: "h-4 w-4",
                    style: { color: INTENSITAET_SUB_META[activeSubHebel].color }
                  })}
                  <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: INTENSITAET_SUB_META[activeSubHebel].color }}>
                    {INTENSITAET_SUB_META[activeSubHebel].label}
                  </p>
                </div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-base font-bold tabular-nums" style={{ color: INTENSITAET_SUB_META[activeSubHebel].color }}>
                    {fmtDe(benchmark.intensitaet.subHebel[activeSubHebel].kunde)} {INTENSITAET_SUB_META[activeSubHebel].unit}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="text-base font-bold tabular-nums text-primary">
                    {fmtDe(benchmark.intensitaet.subHebel[activeSubHebel].benchmark)} {INTENSITAET_SUB_META[activeSubHebel].unit}
                  </span>
                  <span className="text-[10px] text-muted-foreground">(Benchmark)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {INTENSITAET_SUB_META[activeSubHebel].longDesc}
                </p>
              </div>
            )}
            </div>

            {/* Kennzahlen rechts daneben */}
            <div className="flex-shrink-0 border-l border-border/40 pl-4 space-y-2">
              {/* Kunde */}
              <div>
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-1">Kunde</p>
                <div className="space-y-0.5 text-[10px] tabular-nums">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Gesamtfalle</span>
                    <span className="text-foreground font-medium">{fmtInt(benchmark.total_faelle)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Gesamtanalysen</span>
                    <span className="text-foreground font-medium">{fmtInt(benchmark.total_analysen)}</span>
                  </div>
                  <div 
                    className={`flex justify-between gap-3 rounded px-1 -mx-1 transition-all`}
                    style={{ 
                      backgroundColor: activeHaupt === "indikation" ? `${HAUPT_META.indikation.color}15` : "transparent"
                    }}
                  >
                    <span className={activeHaupt === "indikation" ? "font-medium" : "text-muted-foreground"} style={{ color: activeHaupt === "indikation" ? HAUPT_META.indikation.color : undefined }}>
                      Falle mit Labor
                    </span>
                    <span className={activeHaupt === "indikation" ? "font-semibold" : "text-foreground font-medium"} style={{ color: activeHaupt === "indikation" ? HAUPT_META.indikation.color : undefined }}>
                      {fmtInt(benchmark.faelle_mit_labor)}
                    </span>
                  </div>
                  <div 
                    className={`flex justify-between gap-3 rounded px-1 -mx-1 transition-all`}
                    style={{ 
                      backgroundColor: (activeHaupt === "intensitaet" || activeSubHebel) 
                        ? `${activeSubHebel ? INTENSITAET_SUB_META[activeSubHebel].color : HAUPT_META.intensitaet.color}15` 
                        : "transparent"
                    }}
                  >
                    <span 
                      className={(activeHaupt === "intensitaet" || activeSubHebel) ? "font-medium" : "text-muted-foreground"} 
                      style={{ color: (activeHaupt === "intensitaet" || activeSubHebel) ? (activeSubHebel ? INTENSITAET_SUB_META[activeSubHebel].color : HAUPT_META.intensitaet.color) : undefined }}
                    >
                      Falle Mehrfach
                    </span>
                    <span 
                      className={(activeHaupt === "intensitaet" || activeSubHebel) ? "font-semibold" : "text-foreground font-medium"} 
                      style={{ color: (activeHaupt === "intensitaet" || activeSubHebel) ? (activeSubHebel ? INTENSITAET_SUB_META[activeSubHebel].color : HAUPT_META.intensitaet.color) : undefined }}
                    >
                      {fmtInt(benchmark.faelle_mit_mehrfach)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Falle Einzel</span>
                    <span className="text-foreground font-medium">{fmtInt(benchmark.faelle_mit_einzel)}</span>
                  </div>
                </div>
              </div>
              {/* Benchmark */}
              <div className="pt-1.5 border-t border-border/30">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-1">Benchmark</p>
                <div className="space-y-0.5 text-[10px] tabular-nums">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Falle</span>
                    <span className="text-primary font-medium">{fmtInt(benchmark.benchmark_faelle)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
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


