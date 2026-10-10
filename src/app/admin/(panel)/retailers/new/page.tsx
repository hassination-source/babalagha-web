import { requireUser } from "@/lib/auth";
import { saveRetailer } from "@/lib/actions/retailers";
import { PageHeader } from "@/components/admin/ui";
import { RetailerForm } from "@/components/admin/RetailerForm";

export const metadata = { title: "منفذ جديد" };

export default async function NewRetailer() {
  await requireUser("retailers");
  return (
    <>
      <PageHeader title="منفذ بيع جديد" back={{ href: "/admin/retailers", label: "منافذ البيع" }} />
      <RetailerForm retailer={null} action={saveRetailer.bind(null, null)} />
    </>
  );
}
