/** English renderings of the official Arabic package text (translation — needs company approval). */
export function translatePackage(ar: string): string | null {
  const t = ar.trim();
  const bag = /^كيس\s+(\d+)\s+قطع$/.exec(t);
  if (bag) return `Bag of ${bag[1]}`;
  const bagN = /^كيس .+ (\d+) قطع$/.exec(t);
  if (bagN) return `Bag of ${bagN[1]}`;
  if (/^(كيلو|كليو)\s/.test(t)) return "Per kilo";
  if (t.startsWith("قطعة")) return "Per piece";
  if (t === "حجم كبير جداً") return "Extra large";
  if (t === "حجم كبير") return "Large";
  if (t === "حجم متوسط") return "Medium";
  if (t === "حجم صغير") return "Small";
  if (t === "كيس خبز شعير خالص درجة اولى") return "Bag — pure first-grade barley";
  if (t.startsWith("كيس")) return "Bag";
  return null;
}
