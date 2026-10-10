import { getSessionUser } from "@/lib/auth";
import { RETAILER_CSV_COLUMNS, toCsv } from "@/lib/csv";

/** Import template with one clearly fictional example row (delete it before importing real data). */
export async function GET() {
  if (!(await getSessionUser())) return new Response("Forbidden", { status: 403 });
  const example = [
    "مثال — احذف هذا الصف", "Example — delete this row", "SUPERMARKET", "بغداد", "بغداد", "Baghdad", "الكرادة", "Karrada",
    "شارع ٦٢، قرب ساحة كهرمانة", "62nd St, near Kahramana Sq.", "33.3062", "44.4234", "07XX XXX XXXX", "يومياً 8 ص – 11 م", "", "", "false", "PENDING",
  ];
  return new Response(toCsv([...RETAILER_CSV_COLUMNS], [example]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="babalagha-retailers-template.csv"',
    },
  });
}
