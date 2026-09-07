import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { FeeReceipts } from "@/components/dashboard/FeeReceipts";
import type { Admission, FeeStructureRow } from "@/types/api";

export default async function FeeReceiptPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/unauthorized");

  const [admission, fees] = await Promise.all([
    serverApiFetch<Admission>("/admissions/me"),
    serverApiFetch<FeeStructureRow[]>("/fees/me"),
  ]);
  const hasPaid = (fees ?? []).some((fee) => fee.status === "PAID");

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink print:hidden">Fee Receipt</h2>

      {!admission?.paid && !hasPaid ? (
        <p className="mt-4 max-w-2xl rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted print:hidden">
          No fee payment on file yet.
        </p>
      ) : (
        <div className="mt-4">
          <FeeReceipts admission={admission} fees={fees ?? []} />
        </div>
      )}
    </div>
  );
}
