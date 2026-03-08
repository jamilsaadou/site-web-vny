"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type MediaPickerItem = {
  id: string;
  title: string;
  filePath: string;
  altText?: string | null;
};

type AdminMediaPickerProps = {
  name: string;
  items: MediaPickerItem[];
  defaultValue?: string | null;
  label?: string;
  className?: string;
};

export function AdminMediaPicker({
  name,
  items,
  defaultValue,
  label = "Galerie d'images",
  className,
}: AdminMediaPickerProps) {
  const [selected, setSelected] = useState(defaultValue ?? "");

  const selectedItem = useMemo(
    () => items.find((item) => item.filePath === selected) ?? null,
    [items, selected],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <input type="hidden" name={name} value={selected} />
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-[var(--muted)]">{label}</label>
        <button
          type="button"
          onClick={() => setSelected("")}
          className="rounded border border-[#d8dde3] bg-white px-2 py-1 text-[11px] font-semibold text-[#4f5d6b] hover:bg-[#f2f5f7]"
        >
          Aucune
        </button>
      </div>

      {selectedItem ? (
        <div className="rounded-lg border border-[#d8dde3] bg-[#f8fafc] p-2">
          <img
            src={selectedItem.filePath}
            alt={selectedItem.altText || selectedItem.title}
            className="h-24 w-full rounded object-cover"
          />
        </div>
      ) : null}

      <div className="grid max-h-44 grid-cols-3 gap-2 overflow-auto rounded-lg border border-[#d8dde3] bg-white p-2">
        {items.map((item) => {
          const isActive = selected === item.filePath;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item.filePath)}
              className={cn(
                "relative overflow-hidden rounded border",
                isActive ? "border-[#2271b1] ring-2 ring-[rgba(34,113,177,0.2)]" : "border-[#d8dde3]",
              )}
            >
              <img
                src={item.filePath}
                alt={item.altText || item.title}
                className="h-14 w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
