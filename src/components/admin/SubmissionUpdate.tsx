"use client";

import type { ActionResult } from "@/lib/admin";
import { ActionForm, SubmitButton } from "./ActionForm";
import { STATUS_LABEL } from "./labels";

export function SubmissionUpdate({ status, action }: { status: string; action: (fd: FormData) => Promise<ActionResult> }) {
  return (
    <ActionForm action={action} className="space-y-3" resetOnSuccess>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold">الحالة</span>
        <select name="status" defaultValue={status} key={status} className="field !min-h-10 !py-2">
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold">ملاحظة داخلية (لا يراها العميل)</span>
        <textarea name="note" rows={3} className="field" />
      </label>
      <SubmitButton>حفظ</SubmitButton>
    </ActionForm>
  );
}
