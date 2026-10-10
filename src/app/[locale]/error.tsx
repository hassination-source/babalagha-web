"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error.digest ?? error.message);
  }, [error]);
  const en = typeof document !== "undefined" && document.documentElement.lang === "en";
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-start justify-center py-20">
      <h1 className="t-h2 text-seal">{en ? "Something went wrong" : "حدث خطأ غير متوقع"}</h1>
      <p className="mt-3 text-muted">{en ? "The page couldn't load. Try again, or come back in a few minutes." : "تعذّر تحميل الصفحة. حاول مرة أخرى أو عُد بعد دقائق."}</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-8">{en ? "Try again" : "إعادة المحاولة"}</button>
    </div>
  );
}
