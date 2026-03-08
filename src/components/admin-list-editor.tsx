"use client";

import { useState, useId } from "react";

export type ListColumnDef = {
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "select";
  options?: { value: string; label: string }[];
  /** Relative flex weight (default 1) */
  flex?: number;
};

type AdminListEditorProps = {
  /** Hidden textarea name submitted with the form */
  name: string;
  /** Column definitions */
  columns: ListColumnDef[];
  /** Initial pipe-delimited multiline value */
  defaultValue: string;
  /** Label for the "add row" button */
  addLabel?: string;
  /** Row label for the remove button tooltip */
  rowLabel?: string;
};

function parseRows(value: string, colCount: number): string[][] {
  const lines = value
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [Array(colCount).fill("")];
  return lines.map((line) => {
    const parts = line.split("|").map((p) => p.trim());
    while (parts.length < colCount) parts.push("");
    return parts.slice(0, colCount);
  });
}

function serializeRows(rows: string[][]): string {
  return rows
    .filter((row) => row.some((v) => v.trim()))
    .map((row) => row.join("|"))
    .join("\n");
}

const inputClass =
  "w-full rounded-lg border border-[#d8dde3] bg-white px-3 py-2 text-sm outline-none focus:border-[rgba(19,136,74,0.45)] focus:ring-1 focus:ring-[rgba(19,136,74,0.2)]";

export function AdminListEditor({
  name,
  columns,
  defaultValue,
  addLabel = "Ajouter une ligne",
  rowLabel = "ligne",
}: AdminListEditorProps) {
  const uid = useId();
  const [rows, setRows] = useState<string[][]>(() =>
    parseRows(defaultValue, columns.length),
  );

  const serialized = serializeRows(rows);

  const updateCell = (ri: number, ci: number, value: string) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === ri ? row.map((v, j) => (j === ci ? value : v)) : row,
      ),
    );
  };

  const addRow = () => setRows((prev) => [...prev, Array(columns.length).fill("")]);

  const removeRow = (index: number) =>
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length === 0 ? [Array(columns.length).fill("")] : next;
    });

  const moveUp = (index: number) => {
    if (index === 0) return;
    setRows((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    setRows((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {/* Hidden textarea keeps the pipe-delimited value for server action */}
      <textarea
        name={name}
        value={serialized}
        onChange={() => {}}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Column headers */}
      <div
        className="grid gap-2 pr-[76px]"
        style={{ gridTemplateColumns: columns.map((c) => `${c.flex ?? 1}fr`).join(" ") }}
      >
        {columns.map((col) => (
          <p key={col.label} className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[#667085]">
            {col.label}
          </p>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {rows.map((row, ri) => (
          <div key={`${uid}-${ri}`} className="flex items-start gap-2">
            <div
              className="flex-1 grid gap-2"
              style={{ gridTemplateColumns: columns.map((c) => `${c.flex ?? 1}fr`).join(" ") }}
            >
              {columns.map((col, ci) => {
                if (col.type === "select" && col.options) {
                  return (
                    <select
                      key={ci}
                      value={row[ci]}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      className={inputClass}
                    >
                      {col.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  );
                }
                if (col.type === "textarea") {
                  return (
                    <textarea
                      key={ci}
                      value={row[ci]}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      placeholder={col.placeholder ?? col.label}
                      rows={2}
                      className={inputClass}
                    />
                  );
                }
                return (
                  <input
                    key={ci}
                    type="text"
                    value={row[ci]}
                    onChange={(e) => updateCell(ri, ci, e.target.value)}
                    placeholder={col.placeholder ?? col.label}
                    className={inputClass}
                  />
                );
              })}
            </div>

            {/* Row actions */}
            <div className="flex shrink-0 flex-col gap-1">
              <button
                type="button"
                onClick={() => moveUp(ri)}
                disabled={ri === 0}
                className="flex h-7 w-7 items-center justify-center rounded border border-[#d8dde3] bg-white text-[#667085] hover:bg-[#f0f4f8] disabled:opacity-30"
                title="Monter"
              >
                <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 10V4M4 7l3-3 3 3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => moveDown(ri)}
                disabled={ri === rows.length - 1}
                className="flex h-7 w-7 items-center justify-center rounded border border-[#d8dde3] bg-white text-[#667085] hover:bg-[#f0f4f8] disabled:opacity-30"
                title="Descendre"
              >
                <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 4v6M4 7l3 3 3-3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeRow(ri)}
                className="flex h-7 w-7 items-center justify-center rounded border border-[rgba(214,101,0,0.3)] bg-[rgba(240,122,20,0.08)] text-[var(--orange-strong)] hover:bg-[rgba(240,122,20,0.18)]"
                title={`Supprimer cette ${rowLabel}`}
              >
                <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 4h10M5 4V3h4v1M6 7v3M8 7v3M3 4l1 8h6l1-8" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(19,136,74,0.3)] bg-[rgba(19,136,74,0.06)] px-3 py-1.5 text-xs font-semibold text-[var(--green-deep)] hover:bg-[rgba(19,136,74,0.12)] transition"
      >
        <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 2v10M2 7h10" />
        </svg>
        {addLabel}
      </button>
    </div>
  );
}
