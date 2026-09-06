import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { Reveal } from "@/components/Reveal";
import { PayFeeButton } from "@/components/dashboard/PayFeeButton";
import type { Admission, FeeStructureRow } from "@/types/api";

const CADENCE_LABEL: Record<FeeStructureRow["cadence"], string> = {
  SEMESTER: "Per Semester",
  YEAR: "Per Year",
};

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-white">{value ?? "—"}</p>
    </div>
  );
}

export default async function FeeSubmissionPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/unauthorized");

  const [fees, admission] = await Promise.all([
    serverApiFetch<FeeStructureRow[]>("/fees/me"),
    serverApiFetch<Admission>("/admissions/me"),
  ]);
  const rows = fees ?? [];
  const totalDuePaise = rows.filter((f) => f.status === "UNPAID").reduce((sum, f) => sum + f.amountPaise, 0);
  // A not-opted line item (amountPaise 0) never gets paid — it isn't owed —
  // so it shouldn't block the "all fees paid" state.
  const allPaid = rows.length > 0 && rows.every((f) => f.status === "PAID" || f.amountPaise === 0);
  const applicant = admission?.student;

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Fee Submission</h2>

      {applicant && (
        <Reveal className="mt-4 max-w-2xl overflow-hidden rounded-2xl bg-primary-dark text-white shadow-lg shadow-primary-dark/20">
          <div aria-hidden="true" className="h-[3px] w-full bg-gold" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-6 sm:grid-cols-4">
            <DetailItem label="Student" value={applicant.user.fullName} />
            <DetailItem label="UKSSU ID" value={applicant.user.ukssuId ?? "Pending"} />
            <DetailItem label="Course" value={applicant.programme} />
            <DetailItem label="Batch" value={admission?.batch.label} />
          </div>
        </Reveal>
      )}

      {rows.length === 0 ? (
        <p className="mt-4 max-w-2xl rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted">
          No fee structure is set up for your course yet.
        </p>
      ) : (
        <>
          <p className="mt-4 max-w-2xl text-xs text-muted">
            Each fee below is billed once for its cycle — the <span className="font-semibold text-ink">Billing Cycle</span> column shows
            which year or semester this charge is for. A row you&apos;ve already paid won&apos;t be billed again for that cycle.
          </p>
          <Reveal className="mt-3 max-w-2xl overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-primary-dark text-left text-[11px] uppercase tracking-wide text-white">
                  <th className="px-4 py-3 font-semibold">Fee Head</th>
                  <th className="px-4 py-3 font-semibold">Billing Cycle</th>
                  <th className="px-4 py-3 font-semibold">Cadence</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {rows.map((fee) => (
                  <tr key={fee.id}>
                    <td className="px-4 py-3 font-semibold text-ink">
                      {fee.label}
                      {fee.amountPaise === 0 && <span className="ml-2 text-[10.5px] font-normal uppercase tracking-wide text-faint">Not opted</span>}
                    </td>
                    <td className="px-4 py-3 text-muted">{fee.cycleLabel}</td>
                    <td className="px-4 py-3 text-muted">{CADENCE_LABEL[fee.cadence]}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">{formatRupees(fee.amountPaise)}</td>
                    <td className="px-4 py-3 text-right">
                      {fee.amountPaise === 0 ? (
                        <span className="text-xs text-faint">—</span>
                      ) : fee.status === "PAID" ? (
                        <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">
                          Unpaid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-surface">
                  <td className="px-4 py-3 font-display uppercase tracking-wide text-ink" colSpan={3}>
                    Total Due
                  </td>
                  <td colSpan={2} className="px-4 py-3 text-right font-display text-lg text-ink">
                    {formatRupees(totalDuePaise)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </Reveal>
        </>
      )}

      {rows.length > 0 && (
        <div className="mt-4 flex max-w-2xl justify-end">
          {allPaid ? (
            <span className="inline-flex items-center rounded-full bg-success/10 px-3 py-1.5 text-sm font-semibold text-success">
              All fees paid
            </span>
          ) : (
            <PayFeeButton label={`Pay ${formatRupees(totalDuePaise)}`} />
          )}
        </div>
      )}
    </div>
  );
}
