// ── Types ────────────────────────────────────────────────────────────────────

export interface BenchmarkRow {
  parameter_name: string;
  drg: string;
  fachabteilung: string;
  faelle_kunde: number;
  faelle_mit_anforderung_kunde: number;
  multifaelle: number;
  analysen: number;
  befundpreis: number;
  analysen_pro_fall_kunde: number;
  analysen_pro_fall_benchmark: number;
  indikationsquote_kunde: number;
  indikationsquote_benchmark: number;
  frequenz_tage_kunde: number | null;
  frequenz_tage_benchmark: number;
  multiCaseRate: number | null;
  multiCaseRate_benchmark: number;
  span_kunde: number | null;
  span_benchmark: number;
  hauptpot_net_analysen: number;
  pot_indikation_analysen: number;
  pot_multiCaseRate_analysen: number;
  pot_frequenz_analysen: number;
  pot_spanDay_analysen: number;
  indikation_pct: number;
  multiCaseRate_pct: number;
  frequenz_pct: number;
  monitorZeit_pct: number;
}

export interface AggregatedBenchmark {
  analysen_pro_fall_kunde: number;
  analysen_pro_fall_benchmark: number;
  hauptpot_net_analysen: number;
  hauptpot_net_euro: number;
  total_analysen: number;
  total_faelle: number;
  // sub-benchmarks
  indikation: { analysen: number; pct: number; kunde: number; benchmark: number };
  multiCaseRate: { analysen: number; pct: number; kunde: number; benchmark: number };
  frequenz: { analysen: number; pct: number; kunde: number; benchmark: number };
  monitorZeit: { analysen: number; pct: number; kunde: number; benchmark: number };
}

// ── Mock data (inspired by real schema) ──────────────────────────────────────

export const MOCK_DATA: BenchmarkRow[] = [
  {
    parameter_name: "Procalcitonin, immunologisch",
    drg: "801A",
    fachabteilung: "Nephrologie",
    faelle_kunde: 1, faelle_mit_anforderung_kunde: 1, multifaelle: 1,
    analysen: 3, befundpreis: 8.44,
    analysen_pro_fall_kunde: 3, analysen_pro_fall_benchmark: 3,
    indikationsquote_kunde: 100, indikationsquote_benchmark: 100,
    frequenz_tage_kunde: 4.11, frequenz_tage_benchmark: 4.11,
    multiCaseRate: 1.0, multiCaseRate_benchmark: 1.0,
    span_kunde: 8.23, span_benchmark: 8.23,
    hauptpot_net_analysen: 0, pot_indikation_analysen: 0,
    pot_multiCaseRate_analysen: 0, pot_frequenz_analysen: 0, pot_spanDay_analysen: 0,
    indikation_pct: 0, multiCaseRate_pct: 0, frequenz_pct: 0, monitorZeit_pct: 0,
  },
  {
    parameter_name: "Procalcitonin, immunologisch",
    drg: "801B",
    fachabteilung: "Allgemeine Chirurgie",
    faelle_kunde: 2, faelle_mit_anforderung_kunde: 1, multifaelle: 1,
    analysen: 3, befundpreis: 8.44,
    analysen_pro_fall_kunde: 1.5, analysen_pro_fall_benchmark: 1,
    indikationsquote_kunde: 50, indikationsquote_benchmark: 50,
    frequenz_tage_kunde: 1.01, frequenz_tage_benchmark: 1.01,
    multiCaseRate: 0.5, multiCaseRate_benchmark: 0.333,
    span_kunde: 2.01, span_benchmark: 2.01,
    hauptpot_net_analysen: 1, pot_indikation_analysen: 0,
    pot_multiCaseRate_analysen: 0.5, pot_frequenz_analysen: 0, pot_spanDay_analysen: 0,
    indikation_pct: 0, multiCaseRate_pct: 100, frequenz_pct: 0, monitorZeit_pct: 0,
  },
  {
    parameter_name: "Procalcitonin, immunologisch",
    drg: "801C",
    fachabteilung: "Neurochirurgie",
    faelle_kunde: 1, faelle_mit_anforderung_kunde: 1, multifaelle: 1,
    analysen: 2, befundpreis: 8.44,
    analysen_pro_fall_kunde: 2, analysen_pro_fall_benchmark: 1,
    indikationsquote_kunde: 100, indikationsquote_benchmark: 66.67,
    frequenz_tage_kunde: 0.95, frequenz_tage_benchmark: 0.95,
    multiCaseRate: 1.0, multiCaseRate_benchmark: 0.5,
    span_kunde: 0.95, span_benchmark: 0.95,
    hauptpot_net_analysen: 1, pot_indikation_analysen: 0.33,
    pot_multiCaseRate_analysen: 1.0, pot_frequenz_analysen: 0, pot_spanDay_analysen: 0,
    indikation_pct: 14, multiCaseRate_pct: 86, frequenz_pct: 0, monitorZeit_pct: 0,
  },
  {
    parameter_name: "Procalcitonin, immunologisch",
    drg: "801D",
    fachabteilung: "Kardiologie",
    faelle_kunde: 1, faelle_mit_anforderung_kunde: 1, multifaelle: 1,
    analysen: 2, befundpreis: 8.44,
    analysen_pro_fall_kunde: 2, analysen_pro_fall_benchmark: 0.69,
    indikationsquote_kunde: 100, indikationsquote_benchmark: 50,
    frequenz_tage_kunde: 6.68, frequenz_tage_benchmark: 4.63,
    multiCaseRate: 1.0, multiCaseRate_benchmark: 0.231,
    span_kunde: 6.68, span_benchmark: 4.63,
    hauptpot_net_analysen: 1.31, pot_indikation_analysen: 0.5,
    pot_multiCaseRate_analysen: 1.54, pot_frequenz_analysen: 0, pot_spanDay_analysen: 0.31,
    indikation_pct: 7, multiCaseRate_pct: 89, frequenz_pct: 0, monitorZeit_pct: 4,
  },
  {
    parameter_name: "Procalcitonin, immunologisch",
    drg: "801D",
    fachabteilung: "Pneumologie",
    faelle_kunde: 1, faelle_mit_anforderung_kunde: 1, multifaelle: 1,
    analysen: 2, befundpreis: 8.44,
    analysen_pro_fall_kunde: 2, analysen_pro_fall_benchmark: 0.69,
    indikationsquote_kunde: 100, indikationsquote_benchmark: 50,
    frequenz_tage_kunde: 6.7, frequenz_tage_benchmark: 4.63,
    multiCaseRate: 1.0, multiCaseRate_benchmark: 0.231,
    span_kunde: 6.7, span_benchmark: 4.63,
    hauptpot_net_analysen: 1.31, pot_indikation_analysen: 0.5,
    pot_multiCaseRate_analysen: 1.54, pot_frequenz_analysen: 0, pot_spanDay_analysen: 0.31,
    indikation_pct: 7, multiCaseRate_pct: 89, frequenz_pct: 0, monitorZeit_pct: 4,
  },
  // Additional realistic data rows for richer demo
  {
    parameter_name: "CRP (C-reaktives Protein)",
    drg: "801A",
    fachabteilung: "Innere Medizin",
    faelle_kunde: 320, faelle_mit_anforderung_kunde: 280, multifaelle: 195,
    analysen: 1420, befundpreis: 3.50,
    analysen_pro_fall_kunde: 4.44, analysen_pro_fall_benchmark: 2.80,
    indikationsquote_kunde: 87.5, indikationsquote_benchmark: 72,
    frequenz_tage_kunde: 1.2, frequenz_tage_benchmark: 1.8,
    multiCaseRate: 0.696, multiCaseRate_benchmark: 0.52,
    span_kunde: 5.4, span_benchmark: 4.1,
    hauptpot_net_analysen: 524, pot_indikation_analysen: 89,
    pot_multiCaseRate_analysen: 210, pot_frequenz_analysen: 145, pot_spanDay_analysen: 80,
    indikation_pct: 17, multiCaseRate_pct: 40, frequenz_pct: 28, monitorZeit_pct: 15,
  },
  {
    parameter_name: "CRP (C-reaktives Protein)",
    drg: "801B",
    fachabteilung: "Allgemeine Chirurgie",
    faelle_kunde: 180, faelle_mit_anforderung_kunde: 150, multifaelle: 98,
    analysen: 720, befundpreis: 3.50,
    analysen_pro_fall_kunde: 4.0, analysen_pro_fall_benchmark: 2.50,
    indikationsquote_kunde: 83, indikationsquote_benchmark: 65,
    frequenz_tage_kunde: 1.4, frequenz_tage_benchmark: 2.0,
    multiCaseRate: 0.653, multiCaseRate_benchmark: 0.45,
    span_kunde: 4.8, span_benchmark: 3.5,
    hauptpot_net_analysen: 270, pot_indikation_analysen: 54,
    pot_multiCaseRate_analysen: 108, pot_frequenz_analysen: 68, pot_spanDay_analysen: 40,
    indikation_pct: 20, multiCaseRate_pct: 40, frequenz_pct: 25, monitorZeit_pct: 15,
  },
  {
    parameter_name: "TSH (Thyreotropin)",
    drg: "802A",
    fachabteilung: "Endokrinologie",
    faelle_kunde: 95, faelle_mit_anforderung_kunde: 90, multifaelle: 12,
    analysen: 142, befundpreis: 5.80,
    analysen_pro_fall_kunde: 1.49, analysen_pro_fall_benchmark: 1.10,
    indikationsquote_kunde: 94.7, indikationsquote_benchmark: 78,
    frequenz_tage_kunde: 3.2, frequenz_tage_benchmark: 5.0,
    multiCaseRate: 0.133, multiCaseRate_benchmark: 0.08,
    span_kunde: 3.8, span_benchmark: 3.2,
    hauptpot_net_analysen: 37, pot_indikation_analysen: 18,
    pot_multiCaseRate_analysen: 8, pot_frequenz_analysen: 7, pot_spanDay_analysen: 4,
    indikation_pct: 49, multiCaseRate_pct: 22, frequenz_pct: 19, monitorZeit_pct: 10,
  },
  {
    parameter_name: "Troponin T, hochsensitiv",
    drg: "803A",
    fachabteilung: "Kardiologie",
    faelle_kunde: 210, faelle_mit_anforderung_kunde: 195, multifaelle: 160,
    analysen: 980, befundpreis: 12.20,
    analysen_pro_fall_kunde: 4.67, analysen_pro_fall_benchmark: 3.10,
    indikationsquote_kunde: 92.9, indikationsquote_benchmark: 85,
    frequenz_tage_kunde: 0.8, frequenz_tage_benchmark: 1.2,
    multiCaseRate: 0.821, multiCaseRate_benchmark: 0.62,
    span_kunde: 3.2, span_benchmark: 2.5,
    hauptpot_net_analysen: 329, pot_indikation_analysen: 33,
    pot_multiCaseRate_analysen: 148, pot_frequenz_analysen: 99, pot_spanDay_analysen: 49,
    indikation_pct: 10, multiCaseRate_pct: 45, frequenz_pct: 30, monitorZeit_pct: 15,
  },
  {
    parameter_name: "Kalium",
    drg: "801A",
    fachabteilung: "Nephrologie",
    faelle_kunde: 280, faelle_mit_anforderung_kunde: 270, multifaelle: 230,
    analysen: 2100, befundpreis: 1.10,
    analysen_pro_fall_kunde: 7.5, analysen_pro_fall_benchmark: 5.2,
    indikationsquote_kunde: 96.4, indikationsquote_benchmark: 90,
    frequenz_tage_kunde: 0.6, frequenz_tage_benchmark: 0.9,
    multiCaseRate: 0.852, multiCaseRate_benchmark: 0.75,
    span_kunde: 7.1, span_benchmark: 5.8,
    hauptpot_net_analysen: 644, pot_indikation_analysen: 45,
    pot_multiCaseRate_analysen: 193, pot_frequenz_analysen: 258, pot_spanDay_analysen: 148,
    indikation_pct: 7, multiCaseRate_pct: 30, frequenz_pct: 40, monitorZeit_pct: 23,
  },
  {
    parameter_name: "Laktat",
    drg: "801C",
    fachabteilung: "Intensivmedizin",
    faelle_kunde: 150, faelle_mit_anforderung_kunde: 140, multifaelle: 120,
    analysen: 840, befundpreis: 2.80,
    analysen_pro_fall_kunde: 5.6, analysen_pro_fall_benchmark: 3.8,
    indikationsquote_kunde: 93.3, indikationsquote_benchmark: 80,
    frequenz_tage_kunde: 0.5, frequenz_tage_benchmark: 0.8,
    multiCaseRate: 0.857, multiCaseRate_benchmark: 0.65,
    span_kunde: 4.2, span_benchmark: 3.0,
    hauptpot_net_analysen: 270, pot_indikation_analysen: 35,
    pot_multiCaseRate_analysen: 108, pot_frequenz_analysen: 81, pot_spanDay_analysen: 46,
    indikation_pct: 13, multiCaseRate_pct: 40, frequenz_pct: 30, monitorZeit_pct: 17,
  },
  {
    parameter_name: "NT-proBNP",
    drg: "803B",
    fachabteilung: "Kardiologie",
    faelle_kunde: 175, faelle_mit_anforderung_kunde: 160, multifaelle: 85,
    analysen: 410, befundpreis: 15.60,
    analysen_pro_fall_kunde: 2.34, analysen_pro_fall_benchmark: 1.60,
    indikationsquote_kunde: 91.4, indikationsquote_benchmark: 75,
    frequenz_tage_kunde: 2.8, frequenz_tage_benchmark: 4.0,
    multiCaseRate: 0.531, multiCaseRate_benchmark: 0.38,
    span_kunde: 5.6, span_benchmark: 4.2,
    hauptpot_net_analysen: 130, pot_indikation_analysen: 36,
    pot_multiCaseRate_analysen: 46, pot_frequenz_analysen: 30, pot_spanDay_analysen: 18,
    indikation_pct: 28, multiCaseRate_pct: 35, frequenz_pct: 23, monitorZeit_pct: 14,
  },
];

// ── Aggregation helper ───────────────────────────────────────────────────────

export function aggregateBenchmark(
  data: BenchmarkRow[],
  filters?: {
    parameters?: string[];
    drgs?: string[];
    fachabteilungen?: string[];
  }
): AggregatedBenchmark {
  let filtered = data;

  if (filters?.parameters?.length) {
    filtered = filtered.filter((r) => filters.parameters!.includes(r.parameter_name));
  }
  if (filters?.drgs?.length) {
    filtered = filtered.filter((r) => filters.drgs!.includes(r.drg));
  }
  if (filters?.fachabteilungen?.length) {
    filtered = filtered.filter((r) => filters.fachabteilungen!.includes(r.fachabteilung));
  }

  const total_analysen = filtered.reduce((s, r) => s + r.analysen, 0);
  const total_faelle = filtered.reduce((s, r) => s + r.faelle_kunde, 0);
  const analysen_pro_fall_kunde = total_faelle > 0 ? total_analysen / total_faelle : 0;

  // Weighted benchmark
  const weighted_benchmark_sum = filtered.reduce(
    (s, r) => s + r.analysen_pro_fall_benchmark * r.faelle_kunde, 0
  );
  const analysen_pro_fall_benchmark = total_faelle > 0
    ? weighted_benchmark_sum / total_faelle
    : 0;

  const hauptpot_net_analysen = filtered.reduce((s, r) => s + r.hauptpot_net_analysen, 0);
  const avg_preis = filtered.length > 0
    ? filtered.reduce((s, r) => s + r.befundpreis, 0) / filtered.length
    : 0;
  const hauptpot_net_euro = hauptpot_net_analysen * avg_preis;

  // Sub-benchmarks
  const pot_indikation = filtered.reduce((s, r) => s + r.pot_indikation_analysen, 0);
  const pot_multiCase = filtered.reduce((s, r) => s + r.pot_multiCaseRate_analysen, 0);
  const pot_frequenz = filtered.reduce((s, r) => s + r.pot_frequenz_analysen, 0);
  const pot_span = filtered.reduce((s, r) => s + r.pot_spanDay_analysen, 0);
  const pot_total = pot_indikation + pot_multiCase + pot_frequenz + pot_span;

  // Average sub-benchmark values
  const avg = (fn: (r: BenchmarkRow) => number | null) => {
    const vals = filtered.map(fn).filter((v): v is number => v !== null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  return {
    analysen_pro_fall_kunde,
    analysen_pro_fall_benchmark,
    hauptpot_net_analysen,
    hauptpot_net_euro,
    total_analysen,
    total_faelle,
    indikation: {
      analysen: pot_indikation,
      pct: pot_total > 0 ? (pot_indikation / pot_total) * 100 : 0,
      kunde: avg((r) => r.indikationsquote_kunde),
      benchmark: avg((r) => r.indikationsquote_benchmark),
    },
    multiCaseRate: {
      analysen: pot_multiCase,
      pct: pot_total > 0 ? (pot_multiCase / pot_total) * 100 : 0,
      kunde: avg((r) => r.multiCaseRate) * 100,
      benchmark: avg((r) => r.multiCaseRate_benchmark) * 100,
    },
    frequenz: {
      analysen: pot_frequenz,
      pct: pot_total > 0 ? (pot_frequenz / pot_total) * 100 : 0,
      kunde: avg((r) => r.frequenz_tage_kunde),
      benchmark: avg((r) => r.frequenz_tage_benchmark),
    },
    monitorZeit: {
      analysen: pot_span,
      pct: pot_total > 0 ? (pot_span / pot_total) * 100 : 0,
      kunde: avg((r) => r.span_kunde),
      benchmark: avg((r) => r.span_benchmark),
    },
  };
}

// ── Get unique values for filters ────────────────────────────────────────────

export function getUniqueParameters(data: BenchmarkRow[]): string[] {
  return [...new Set(data.map((r) => r.parameter_name))];
}
export function getUniqueDrgs(data: BenchmarkRow[]): string[] {
  return [...new Set(data.map((r) => r.drg))];
}
export function getUniqueFachabteilungen(data: BenchmarkRow[]): string[] {
  return [...new Set(data.map((r) => r.fachabteilung))];
}

// ── Top tables helper ────────────────────────────────────────────────────────

export interface TopItem {
  name: string;
  potentialAnalyses: number;
  potentialEuro: number;
  currentAnalyses: number;
  share: number;
  /** Sub-benchmark percentage shares (sum ~ 100) */
  indikation_pct: number;
  multiCaseRate_pct: number;
  frequenz_pct: number;
  monitorZeit_pct: number;
}

function computeSubPcts(pI: number, pM: number, pF: number, pS: number) {
  const total = pI + pM + pF + pS;
  if (total === 0) return { indikation_pct: 0, multiCaseRate_pct: 0, frequenz_pct: 0, monitorZeit_pct: 0 };
  return {
    indikation_pct: (pI / total) * 100,
    multiCaseRate_pct: (pM / total) * 100,
    frequenz_pct: (pF / total) * 100,
    monitorZeit_pct: (pS / total) * 100,
  };
}

export function getTopParameters(data: BenchmarkRow[], limit = 10): TopItem[] {
  const map = new Map<string, { pot: number; total: number; preis: number; count: number; pI: number; pM: number; pF: number; pS: number }>();
  for (const r of data) {
    const prev = map.get(r.parameter_name) ?? { pot: 0, total: 0, preis: 0, count: 0, pI: 0, pM: 0, pF: 0, pS: 0 };
    prev.pot += r.hauptpot_net_analysen;
    prev.total += r.analysen;
    prev.preis += r.befundpreis;
    prev.count += 1;
    prev.pI += r.pot_indikation_analysen;
    prev.pM += r.pot_multiCaseRate_analysen;
    prev.pF += r.pot_frequenz_analysen;
    prev.pS += r.pot_spanDay_analysen;
    map.set(r.parameter_name, prev);
  }
  return [...map.entries()]
    .map(([name, v]) => ({
      name,
      potentialAnalyses: v.pot,
      potentialEuro: v.pot * (v.preis / v.count),
      currentAnalyses: v.total,
      share: v.total > 0 ? v.pot / v.total : 0,
      ...computeSubPcts(v.pI, v.pM, v.pF, v.pS),
    }))
    .sort((a, b) => b.potentialAnalyses - a.potentialAnalyses)
    .slice(0, limit);
}

export function getTopFachabteilungen(data: BenchmarkRow[], limit = 10): TopItem[] {
  const map = new Map<string, { pot: number; total: number; preis: number; count: number; pI: number; pM: number; pF: number; pS: number }>();
  for (const r of data) {
    const prev = map.get(r.fachabteilung) ?? { pot: 0, total: 0, preis: 0, count: 0, pI: 0, pM: 0, pF: 0, pS: 0 };
    prev.pot += r.hauptpot_net_analysen;
    prev.total += r.analysen;
    prev.preis += r.befundpreis;
    prev.count += 1;
    prev.pI += r.pot_indikation_analysen;
    prev.pM += r.pot_multiCaseRate_analysen;
    prev.pF += r.pot_frequenz_analysen;
    prev.pS += r.pot_spanDay_analysen;
    map.set(r.fachabteilung, prev);
  }
  return [...map.entries()]
    .map(([name, v]) => ({
      name,
      potentialAnalyses: v.pot,
      potentialEuro: v.pot * (v.preis / v.count),
      currentAnalyses: v.total,
      share: v.total > 0 ? v.pot / v.total : 0,
      ...computeSubPcts(v.pI, v.pM, v.pF, v.pS),
    }))
    .sort((a, b) => b.potentialAnalyses - a.potentialAnalyses)
    .slice(0, limit);
}

export function getTopDrgs(data: BenchmarkRow[], limit = 10): TopItem[] {
  const map = new Map<string, { pot: number; total: number; preis: number; count: number; pI: number; pM: number; pF: number; pS: number }>();
  for (const r of data) {
    const prev = map.get(r.drg) ?? { pot: 0, total: 0, preis: 0, count: 0, pI: 0, pM: 0, pF: 0, pS: 0 };
    prev.pot += r.hauptpot_net_analysen;
    prev.total += r.analysen;
    prev.preis += r.befundpreis;
    prev.count += 1;
    prev.pI += r.pot_indikation_analysen;
    prev.pM += r.pot_multiCaseRate_analysen;
    prev.pF += r.pot_frequenz_analysen;
    prev.pS += r.pot_spanDay_analysen;
    map.set(r.drg, prev);
  }
  return [...map.entries()]
    .map(([name, v]) => ({
      name,
      potentialAnalyses: v.pot,
      potentialEuro: v.pot * (v.preis / v.count),
      currentAnalyses: v.total,
      share: v.total > 0 ? v.pot / v.total : 0,
      ...computeSubPcts(v.pI, v.pM, v.pF, v.pS),
    }))
    .sort((a, b) => b.potentialAnalyses - a.potentialAnalyses)
    .slice(0, limit);
}
