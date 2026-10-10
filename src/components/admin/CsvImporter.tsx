"use client";

import { useState, useTransition } from "react";
import { analyzeRetailerCsv, importRetailerCsv, type ImportAnalysis } from "@/lib/actions/retailers";
import { governorateName } from "@/lib/iraq";

export function CsvImporter() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState<ImportAnalysis | null>(null);
  const [mode, setMode] = useState<"skip" | "update">("skip");
  const [done, setDone] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4 rounded-lg border border-line bg-white p-5">
      <label className="block">
        <span className="mb-1 block text-sm font-semibold">ملف CSV</span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="text-sm file:me-3 file:rounded file:border-0 file:bg-dough file:px-3 file:py-2"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            setDone(null);
            setAnalysis(null);
            if (!f) return;
            setFileName(f.name);
            const t = await f.text();
            setText(t);
            start(async () => setAnalysis(await analyzeRetailerCsv(t)));
          }}
        />
      </label>
      {pending && <p className="text-sm text-muted">جارٍ المعالجة…</p>}

      {analysis && !analysis.ok && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-red-800">{analysis.error}</p>}

      {analysis?.ok && !done && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            <Stat label="صفوف" v={analysis.total} />
            <Stat label="صالحة" v={analysis.valid} />
            <Stat label="مكررة" v={analysis.duplicates} />
            <Stat label="غير صالحة" v={analysis.invalid.length} bad={analysis.invalid.length > 0} />
          </div>
          {analysis.invalid.length > 0 && (
            <details className="rounded-md border border-red-200 bg-red-50/50 p-3 text-sm" open>
              <summary className="cursor-pointer font-semibold text-red-800">صفوف لن تُستورد ({analysis.invalid.length})</summary>
              <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                {analysis.invalid.map((r) => (
                  <li key={r.row}>صف {r.row}: <span dir="ltr">{r.errors.join("; ")}</span></li>
                ))}
              </ul>
            </details>
          )}
          <div className="max-h-72 overflow-auto rounded-md border border-line">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-flour text-xs text-muted"><tr><th className="p-2 text-start">صف</th><th className="p-2 text-start">الاسم</th><th className="p-2 text-start">الموقع</th><th className="p-2 text-start">ملاحظات</th></tr></thead>
              <tbody className="divide-y divide-line">
                {analysis.sample.map((r) => (
                  <tr key={r.row}>
                    <td className="p-2 text-muted">{r.row}</td>
                    <td className="p-2">{r.nameAr}</td>
                    <td className="p-2">{r.cityAr}، {governorateName(r.governorate, "ar")}</td>
                    <td className="p-2 text-xs">
                      {r.duplicate && <span className="text-amber-700">موجود مسبقاً · </span>}
                      {!r.hasCoords && <span className="text-red-700">بلا إحداثيات</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {analysis.duplicates > 0 && (
            <fieldset className="text-sm">
              <legend className="mb-1 font-semibold">المنافذ الموجودة مسبقاً (نفس الاسم والمحافظة والمدينة):</legend>
              <label className="me-4 inline-flex items-center gap-2"><input type="radio" checked={mode === "skip"} onChange={() => setMode("skip")} /> تجاهلها</label>
              <label className="inline-flex items-center gap-2"><input type="radio" checked={mode === "update"} onChange={() => setMode("update")} /> تحديثها ببيانات الملف</label>
            </fieldset>
          )}
          <button
            type="button"
            disabled={pending || analysis.valid === 0}
            onClick={() => start(async () => setDone(await importRetailerCsv(text, mode)))}
            className="min-h-10 rounded-md bg-seal px-5 text-sm font-semibold text-flour disabled:opacity-50"
          >
            استيراد {analysis.valid} منفذ من {fileName}
          </button>
        </div>
      )}

      {done && (
        <p role={done.ok ? "status" : "alert"} className={`rounded-md px-4 py-3 ${done.ok ? "bg-kashi/10 text-kashi-deep" : "bg-red-50 text-red-800"}`}>
          {done.message} {done.ok && <a href="/admin/retailers" className="font-semibold underline">عرض المنافذ</a>}
        </p>
      )}
    </div>
  );
}

function Stat({ label, v, bad }: { label: string; v: number; bad?: boolean }) {
  return (
    <div className={`rounded-md border p-2 ${bad ? "border-red-200 bg-red-50" : "border-line bg-flour"}`}>
      <p className="text-xl font-bold">{v}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
