"use client";

import { TerminalSelect } from "@/components/ui/select";
import { VGC_ITEMS } from "@/data/items";

interface ItemSelectProps {
  value: string | null;
  onChange: (name: string | null) => void;
}

export function ItemSelect({ value, onChange }: ItemSelectProps) {
  return (
    <TerminalSelect
      label="ITEM"
      value={value ?? ""}
      onChange={(next) => onChange(next || null)}
      options={[
        { value: "", label: "— NONE —" },
        ...VGC_ITEMS.map((item) => ({
          value: item.value,
          label: item.label.toUpperCase(),
        })),
      ]}
    />
  );
}
