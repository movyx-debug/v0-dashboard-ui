"use client";

import { useMemo, useState, useCallback } from "react";
import {
  MOCK_DATA,
  aggregateBenchmark,
  getUniqueParameters,
  getUniqueDrgs,
  getUniqueFachabteilungen,
  getTopParameters,
  getTopFachabteilungen,
  getTopDrgs,
} from "@/lib/benchmark-data";
import BenchmarkSection from "@/components/benchmark-section";
import FilterPanel from "@/components/filter-panel";
import TopItemsTable from "@/components/top-items-table";
import { Building2, FlaskConical, Stethoscope, TestTube } from "lucide-react";

export default function DashboardPage() {
  // ── Filter state ─────────────────────────────────────────────────────────
  const [activeParams, setActiveParams] = useState<string[]>([]);
  const [activeDrgs, setActiveDrgs] = useState<string[]>([]);
  const [activeFachs, setActiveFachs] = useState<string[]>([]);

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  const onToggleParam = useCallback(
    (p: string) => setActiveParams((prev) => toggle(prev, p)),
    []
  );
  const onToggleDrg = useCallback(
    (d: string) => setActiveDrgs((prev) => toggle(prev, d)),
    []
  );
  const onToggleFach = useCallback(
    (f: string) => setActiveFachs((prev) => toggle(prev, f)),
    []
  );
  const onClearAll = useCallback(() => {
    setActiveParams([]);
    setActiveDrgs([]);
    setActiveFachs([]);
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────
  const allParams = useMemo(() => getUniqueParameters(MOCK_DATA), []);
  const allDrgs = useMemo(() => getUniqueDrgs(MOCK_DATA), []);
  const allFachs = useMemo(() => getUniqueFachabteilungen(MOCK_DATA), []);

  const filters = useMemo(
    () => ({
      parameters: activeParams.length > 0 ? activeParams : undefined,
      drgs: activeDrgs.length > 0 ? activeDrgs : undefined,
      fachabteilungen: activeFachs.length > 0 ? activeFachs : undefined,
    }),
    [activeParams, activeDrgs, activeFachs]
  );

  const benchmark = useMemo(() => aggregateBenchmark(MOCK_DATA, filters), [filters]);

  // Filter data for top tables
  const filteredData = useMemo(() => {
    let d = MOCK_DATA;
    if (filters.parameters?.length)
      d = d.filter((r) => filters.parameters!.includes(r.parameter_name));
    if (filters.drgs?.length)
      d = d.filter((r) => filters.drgs!.includes(r.drg));
    if (filters.fachabteilungen?.length)
      d = d.filter((r) => filters.fachabteilungen!.includes(r.fachabteilung));
    return d;
  }, [filters]);

  const topParams = useMemo(() => getTopParameters(filteredData), [filteredData]);
  const topFachs = useMemo(() => getTopFachabteilungen(filteredData), [filteredData]);
  const topDrgs = useMemo(() => getTopDrgs(filteredData), [filteredData]);

  // ── Title ────────────────────────────────────────────────────────────────
  const title = useMemo(() => {
    const parts: string[] = [];
    if (activeParams.length) parts.push(activeParams.join(", "));
    if (activeDrgs.length) parts.push(`DRG: ${activeDrgs.join(", ")}`);
    if (activeFachs.length) parts.push(activeFachs.join(", "));
    return parts.length > 0 ? parts.join(" | ") : "Gesamtpotenzial Ihrer Einrichtung";
  }, [activeParams, activeDrgs, activeFachs]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-[1600px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-xl">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div className="text-xs">
                <span className="text-muted-foreground">Musterkrankenhaus</span>
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

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main className="mx-auto max-w-[1600px] p-6">
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">
          {/* Left sidebar: Filters */}
          <aside className="space-y-6">
            <FilterPanel
              parameters={allParams}
              drgs={allDrgs}
              fachabteilungen={allFachs}
              activeParameters={activeParams}
              activeDrgs={activeDrgs}
              activeFachabteilungen={activeFachs}
              onToggleParameter={onToggleParam}
              onToggleDrg={onToggleDrg}
              onToggleFachabteilung={onToggleFach}
              onClearAll={onClearAll}
            />
          </aside>

          {/* Right: Dashboard content */}
          <div className="space-y-6">
            {/* Benchmark Section */}
            <BenchmarkSection benchmark={benchmark} title={title} />

            {/* Top Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TopItemsTable
                title="Top Parameter"
                icon={<TestTube className="h-4 w-4 text-blue-500" />}
                items={topParams}
                activeItems={activeParams}
                onToggle={onToggleParam}
                accentColor="#3b82f6"
              />
              <TopItemsTable
                title="Top Fachabteilungen"
                icon={<Stethoscope className="h-4 w-4 text-emerald-500" />}
                items={topFachs}
                activeItems={activeFachs}
                onToggle={onToggleFach}
                accentColor="#10b981"
              />
              <TopItemsTable
                title="Top DRGs"
                icon={<Building2 className="h-4 w-4 text-amber-500" />}
                items={topDrgs}
                activeItems={activeDrgs}
                onToggle={onToggleDrg}
                accentColor="#f59e0b"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
