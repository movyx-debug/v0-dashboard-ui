"use client";

import type { TopItem } from "@/lib/benchmark-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type React from "react";

const fmtInt = (n: number) => Math.round(n).toLocaleString("de-DE");
const fmtEur = (n: number) =>
  `${Math.round(n).toLocaleString("de-DE")} EUR`;

interface Props {
  title: string;
  icon: React.ReactNode;
  items: TopItem[];
  activeItem: string | null;
  onSelect: (name: string) => void;
  accentColor: string;
}

export default function TopItemsTable({
  title,
  icon,
  items,
  activeItem,
  onSelect,
  accentColor,
}: Props) {
  return (
    <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[380px]">
      {/* Header */}
      <div className="px-5 py-3.5 border-b flex items-center gap-2 flex-shrink-0">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">
          Klicken zum Filtern
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="text-xs px-4 py-2">Name</TableHead>
              <TableHead className="text-xs px-3 py-2 text-right">
                Potenzial
              </TableHead>
              <TableHead className="text-xs px-3 py-2 text-right">
                EUR
              </TableHead>
              <TableHead className="text-xs px-3 py-2 text-right">
                Anteil
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isActive = activeItem === item.name;
              return (
                <TableRow
                  key={item.name}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    isActive ? "bg-muted/70" : ""
                  }`}
                  onClick={() => onSelect(item.name)}
                >
                  <TableCell className="px-4 py-2.5 text-xs font-medium text-foreground max-w-[180px] truncate">
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <div
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: accentColor }}
                        />
                      )}
                      <span className="truncate">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-xs text-right font-semibold text-foreground tabular-nums">
                    {fmtInt(item.potentialAnalyses)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-xs text-right text-muted-foreground tabular-nums">
                    {fmtEur(item.potentialEuro)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-xs text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(item.share * 100, 100)}%`,
                            backgroundColor: accentColor,
                          }}
                        />
                      </div>
                      <span className="text-muted-foreground tabular-nums w-8">
                        {Math.round(item.share * 100)}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
