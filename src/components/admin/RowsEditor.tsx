"use client";

import { useState } from "react";

type Col = { key: string; label: string; dir?: "ltr" | "rtl"; width?: string };

/** Editable list of rows serialised into a hidden JSON input (variants, nutrition rows). */
export function RowsEditor({ name, cols, initial, addLabel }: { name: string; cols: Col[]; initial: Record<string, string>[]; addLabel: string }) {
  const empty = () => Object.fromEntries(cols.map((c) => [c.key, ""]));
  const [rows, setRows] = useState<Record<string, string>[]>(initial);
  const clean = rows.filter((r) => Object.values(r).some((v) => v.trim()));
  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(clean)} />
      {rows.length > 0 && (
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              {cols.map((c) => (
                <label key={c.key} className={`grow ${c.width ?? "basis-40"}`}>
                  <span className="mb-1 block text-xs text-muted">{c.label}</span>
                  <input
                    value={r[c.key] ?? ""}
                    dir={c.dir}
                    onChange={(e) => setRows((all) => all.map((x, j) => (j === i ? { ...x, [c.key]: e.target.value } : x)))}
                    className="field !min-h-9 !py-1.5 text-sm"
                  />
                </label>
              ))}
              <div className="flex gap-1">
                <button type="button" aria-label="أعلى" disabled={i === 0} onClick={() => setRows((all) => { const a = [...all]; [a[i - 1], a[i]] = [a[i]!, a[i - 1]!]; return a; })} className="size-9 rounded border border-line disabled:opacity-30">↑</button>
                <button type="button" aria-label="حذف" onClick={() => setRows((all) => all.filter((_, j) => j !== i))} className="size-9 rounded border border-line text-red-700">×</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button type="button" onClick={() => setRows((all) => [...all, empty()])} className="mt-2 text-sm font-semibold text-kashi-deep hover:underline">+ {addLabel}</button>
    </div>
  );
}
