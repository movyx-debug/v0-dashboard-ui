"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SETTINGS = [
  {
    id: "berechnungsmethode",
    label: "Berechnungsmethode",
    options: [
      { value: "mittelwert", label: "Mittelwert" },
      { value: "median", label: "Median" },
      { value: "q1", label: "Q1" },
      { value: "q3", label: "Q3" },
    ],
    defaultValue: "mittelwert",
  },
  {
    id: "potenzialtyp",
    label: "Potenzialtyp",
    options: [
      { value: "netto", label: "Netto" },
      { value: "exzess", label: "Exzess" },
    ],
    defaultValue: "netto",
  },
  {
    id: "versicherungsart",
    label: "Versicherungsart",
    options: [
      { value: "gkv", label: "GKV" },
      { value: "pkv", label: "PKV" },
      { value: "gkv+pkv", label: "GKV + PKV" },
      { value: "alle", label: "Alle" },
    ],
    defaultValue: "gkv",
  },
] as const;

export default function SettingsPopover() {
  const [values, setValues] = useState<Record<string, string>>({
    berechnungsmethode: "mittelwert",
    potenzialtyp: "netto",
    versicherungsart: "gkv",
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Einstellungen</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[260px] p-0">
        <div className="px-3 py-2.5 border-b">
          <p className="text-xs font-semibold text-foreground">Einstellungen</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Berechnungsparameter anpassen
          </p>
        </div>
        <div className="p-3 space-y-3">
          {SETTINGS.map((setting) => (
            <div key={setting.id} className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                {setting.label}
              </label>
              <Select
                value={values[setting.id]}
                onValueChange={(v) =>
                  setValues((prev) => ({ ...prev, [setting.id]: v }))
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {setting.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
