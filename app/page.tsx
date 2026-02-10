"use client";

import { useMemo, useState, useCallback } from "react";
import {
  MOCK_DATA,
  aggregateBenchmark,
  getTopParameters,
  getTopFachabteilungen,
  getTopDrgs,
} from "@/lib/benchmark-data";
import BenchmarkSection from "@/components/benchmark-section";
import FilterBar from "@/components/filter-panel";
import TopItemsTable from "@/components/top-items-table";
import { Building2, FlaskConical, Stethoscope, TestTube } from "lucide-react";

export default function DashboardPage() {
  // ── Single-select filter state ──────────────────────────────────────────
  const [activeParam, setActiveParam] = useState<string | null>(null);
  const [activeDrg, setActiveDrg] = useState<string | null>(null);
  const [activeFach, setActiveFach] = useState<string | null>(null);

  // Clicking a table row sets the filter (or clears if same value clicked again)
  const onSelectParam = useCallback(
    (p: string) => setActiveParam((prev) => (prev === p ? null : p)),
    [],
  );
  const onSelectDrg = useCallback(
    (d: string) => setActiveDrg((prev) => (prev === d ? null : d)),
    [],
  );
  const onSelectFach = useCallback(
    (f: string) => setActiveFach((prev) => (prev === f ? null : f)),
    [],
  );

  const onClearAll = useCallback(() => {
    setActiveParam(null);
    setActiveDrg(null);
    setActiveFach(null);
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────
  const filters = useMemo(
    () => ({
      parameters: activeParam ? [activeParam] : undefined,
      drgs: activeDrg ? [activeDrg] : undefined,
      fachabteilungen: activeFach ? [activeFach] : undefined,
    }),
    [activeParam, activeDrg, activeFach],
  );

  const benchmark = useMemo(
    () => aggregateBenchmark(MOCK_DATA, filters),
    [filters],
  );

  // Filter data for top tables
  const filteredData = useMemo(() => {
    let d = MOCK_DATA;
    if (activeParam) d = d.filter((r) => r.parameter_name === activeParam);
    if (activeDrg) d = d.filter((r) => r.drg === activeDrg);
    if (activeFach) d = d.filter((r) => r.fachabteilung === activeFach);
    return d;
  }, [activeParam, activeDrg, activeFach]);

  const topParams = useMemo(
    () => getTopParameters(filteredData),
    [filteredData],
  );
  const topFachs = useMemo(
    () => getTopFachabteilungen(filteredData),
    [filteredData],
  );
  const topDrgs = useMemo(() => getTopDrgs(filteredData), [filteredData]);

  // ── Title ───────────────────────────────────────────────────────────────
  const title = useMemo(() => {
    const parts: string[] = [];
    if (activeParam) parts.push(activeParam);
    if (activeDrg) parts.push(`DRG: ${activeDrg}`);
    if (activeFach) parts.push(activeFach);
    return parts.length > 0
      ? parts.join(" | ")
      : "Gesamtpotenzial Ihrer Einrichtung";
  }, [activeParam, activeDrg, activeFach]);

  const hasFilters = !!(activeParam || activeDrg || activeFach);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-[1600px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                LabLense
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">
                Benchmarking Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-xl">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div className="text-xs">
                <span className="text-muted-foreground">
                  Musterkrankenhaus
                </span>
                <span className="mx-2 text-border">|</span>
                <span className="font-semibold text-foreground">2025</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-xl text-xs font-medium">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Benchmark aktiv
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content (full-width, no sidebar) ──────────────────────── */}
      <main className="mx-auto max-w-[1600px] p-6 space-y-6">
        {/* Compact filter bar — only visible when filters active */}
        {hasFilters && (
          <FilterBar
            activeParameter={activeParam}
            activeDrg={activeDrg}
            activeFach={activeFach}
            onClearParameter={() => setActiveParam(null)}
            onClearDrg={() => setActiveDrg(null)}
            onClearFach={() => setActiveFach(null)}
            onClearAll={onClearAll}
          />
        )}

        {/* Benchmark Section */}
        <BenchmarkSection benchmark={benchmark} title={title} />

        {/* Top Tables — click a row to filter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TopItemsTable
            title="Top Parameter"
            icon={<TestTube className="h-4 w-4 text-blue-500" />}
            items={topParams}
            activeItem={activeParam}
            onSelect={onSelectParam}
            accentColor="#3b82f6"
          />
          <TopItemsTable
            title="Top Fachabteilungen"
            icon={<Stethoscope className="h-4 w-4 text-emerald-500" />}
            items={topFachs}
            activeItem={activeFach}
            onSelect={onSelectFach}
            accentColor="#10b981"
          />
          <TopItemsTable
            title="Top DRGs"
            icon={<Building2 className="h-4 w-4 text-amber-500" />}
            items={topDrgs}
            activeItem={activeDrg}
            onSelect={onSelectDrg}
            accentColor="#f59e0b"
          />
        </div>
      </main>
    </div>
  );
}
