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
import DetailTable from "@/components/detail-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, FlaskConical, Stethoscope, TestTube, LayoutGrid, TableProperties } from "lucide-react";

export default function DashboardPage() {
  const [activeParam, setActiveParam] = useState<string | null>(null);
  const [activeDrg, setActiveDrg] = useState<string | null>(null);
  const [activeFach, setActiveFach] = useState<string | null>(null);

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

  const title = useMemo(() => {
    const parts: string[] = [];
    if (activeParam) parts.push(activeParam);
    if (activeDrg) parts.push(`DRG ${activeDrg}`);
    if (activeFach) parts.push(activeFach);
    return parts.length > 0 ? parts.join(" | ") : "Netto-Einsparpotenzial";
  }, [activeParam, activeDrg, activeFach]);

  return (
    <div className="min-h-screen bg-background">
      {/* Compact header */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-[1600px] px-5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <FlaskConical className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">LabLense</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">Benchmarking</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Musterkrankenhaus</span>
            <span className="text-[10px] text-muted-foreground">|</span>
            <span className="text-xs font-semibold text-foreground">2025</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-5 flex flex-col gap-3">
        {/* Sticky cockpit: benchmark + filter bar */}
        <div className="sticky top-0 z-30 -mx-5 px-5 pt-3 pb-2 bg-background/85 backdrop-blur-md">
          <BenchmarkSection benchmark={benchmark} title={title} />
          <div className="mt-2">
            <FilterBar
              activeParameter={activeParam}
              activeDrg={activeDrg}
              activeFach={activeFach}
              onClearParameter={() => setActiveParam(null)}
              onClearDrg={() => setActiveDrg(null)}
              onClearFach={() => setActiveFach(null)}
              onClearAll={onClearAll}
            />
          </div>
        </div>

        {/* Tab views */}
        <Tabs defaultValue="top" className="w-full">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="top" className="gap-1.5 text-xs">
              <LayoutGrid className="h-3.5 w-3.5" />
              Top-Ansicht
            </TabsTrigger>
            <TabsTrigger value="detail" className="gap-1.5 text-xs">
              <TableProperties className="h-3.5 w-3.5" />
              Detail-Ansicht
            </TabsTrigger>
          </TabsList>

          <TabsContent value="top">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
          </TabsContent>

          <TabsContent value="detail">
            <DetailTable
              data={filteredData}
              onSelectParam={onSelectParam}
              onSelectDrg={onSelectDrg}
              onSelectFach={onSelectFach}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
