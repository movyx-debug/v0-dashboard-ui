"use client";

import React from "react"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Filter, TestTube, Building2, Stethoscope } from "lucide-react";

interface FilterPanelProps {
  parameters: string[];
  drgs: string[];
  fachabteilungen: string[];
  activeParameters: string[];
  activeDrgs: string[];
  activeFachabteilungen: string[];
  onToggleParameter: (p: string) => void;
  onToggleDrg: (d: string) => void;
  onToggleFachabteilung: (f: string) => void;
  onClearAll: () => void;
}

export default function FilterPanel({
  parameters,
  drgs,
  fachabteilungen,
  activeParameters,
  activeDrgs,
  activeFachabteilungen,
  onToggleParameter,
  onToggleDrg,
  onToggleFachabteilung,
  onClearAll,
}: FilterPanelProps) {
  const hasFilters =
    activeParameters.length > 0 ||
    activeDrgs.length > 0 ||
    activeFachabteilungen.length > 0;

  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Filter</h3>
          {hasFilters && (
            <Badge variant="secondary" className="text-xs">
              {activeParameters.length + activeDrgs.length + activeFachabteilungen.length}
            </Badge>
          )}
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            Zurucksetzen
          </Button>
        )}
      </div>

      {/* Active filters */}
      {hasFilters && (
        <div className="px-5 py-3 border-b bg-secondary/30">
          <p className="text-xs text-muted-foreground mb-2">Aktive Filter</p>
          <div className="flex flex-wrap gap-1.5">
            {activeParameters.map((p) => (
              <FilterChip key={`p-${p}`} label={p} color="blue" onRemove={() => onToggleParameter(p)} />
            ))}
            {activeDrgs.map((d) => (
              <FilterChip key={`d-${d}`} label={d} color="amber" onRemove={() => onToggleDrg(d)} />
            ))}
            {activeFachabteilungen.map((f) => (
              <FilterChip key={`f-${f}`} label={f} color="emerald" onRemove={() => onToggleFachabteilung(f)} />
            ))}
          </div>
        </div>
      )}

      <ScrollArea className="max-h-[420px]">
        <div className="p-5 space-y-5">
          {/* Parameters */}
          <FilterGroup
            icon={<TestTube className="h-3.5 w-3.5" />}
            title="Parameter"
            items={parameters}
            activeItems={activeParameters}
            onToggle={onToggleParameter}
            colorClass="bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20"
            activeColorClass="bg-blue-500 text-blue-50 border-blue-500 hover:bg-blue-600"
          />

          {/* DRGs */}
          <FilterGroup
            icon={<Building2 className="h-3.5 w-3.5" />}
            title="DRG"
            items={drgs}
            activeItems={activeDrgs}
            onToggle={onToggleDrg}
            colorClass="bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/20"
            activeColorClass="bg-amber-500 text-amber-50 border-amber-500 hover:bg-amber-600"
          />

          {/* Fachabteilungen */}
          <FilterGroup
            icon={<Stethoscope className="h-3.5 w-3.5" />}
            title="Fachabteilung"
            items={fachabteilungen}
            activeItems={activeFachabteilungen}
            onToggle={onToggleFachabteilung}
            colorClass="bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-500/20"
            activeColorClass="bg-emerald-500 text-emerald-50 border-emerald-500 hover:bg-emerald-600"
          />
        </div>
      </ScrollArea>
    </div>
  );
}

function FilterGroup({
  icon,
  title,
  items,
  activeItems,
  onToggle,
  colorClass,
  activeColorClass,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  activeItems: string[];
  onToggle: (item: string) => void;
  colorClass: string;
  activeColorClass: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const isActive = activeItems.includes(item);
          return (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isActive ? activeColorClass : colorClass
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  color,
  onRemove,
}: {
  label: string;
  color: "blue" | "amber" | "emerald";
  onRemove: () => void;
}) {
  const styles = {
    blue: "bg-blue-100 text-blue-800",
    amber: "bg-amber-100 text-amber-800",
    emerald: "bg-emerald-100 text-emerald-800",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[color]}`}>
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:opacity-70 cursor-pointer"
        aria-label={`Filter entfernen: ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
