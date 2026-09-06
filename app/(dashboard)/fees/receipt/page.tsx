import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { Reveal } from "@/components/Reveal";
import { PrintButton } from "@/components/dashboard/PrintButton";
import { PrintLetterhead, PrintFooter, PrintRow } from "@/components/dashboard/PrintReceipt";
import type { Admission, FeeStructureRow } from "@/types/api";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white px-4 py-3">
      <dt className="text-[10.5px] uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value ?? "—"}</dd>
    </div>
  );
}

export default async function FeeReceiptPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "STUDENT") redirect("/unauthorized");

  const [admission, fees] = await Promise.all([
    serverApiFetch<Admission>("/admissions/me"),
    serverApiFetch<FeeStructureRow[]>("/fees/me"),
  ]);
  const paidFees = (fees ?? []).filter((fee) => fee.status === "PAID");
  const fullName = admission?.student.user.fullName;

  // A combined checkout (course fee + hostel fee paid together) shares one
  // razorpayPaymentId across FeePayment rows — group by that so it shows as
  // one receipt with a breakdown, not one card per fee line item.
  const paymentGroups = new Map<string, FeeStructureRow[]>();
  for (const fee of paidFees) {
    const key = fee.razorpayPaymentId ?? fee.feePaymentId ?? fee.id;
    paymentGroups.set(key, [...(paymentGroups.get(key) ?? []), fee]);
  }

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink print:hidden">Fee Receipt</h2>

      {!admission?.paid && paidFees.length === 0 ? (
        <p className="mt-4 max-w-2xl rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-muted print:hidden">
          No fee payment on file yet.
        </p>
      ) : (
        <div className="mt-4 max-w-2xl space-y-6">
          {admission?.paid && (
            <div data-receipt="admission-fee" className="break-inside-avoid">
              <Reveal className="print:hidden">
                <div className="mb-3 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span aria-hidden="true" className="h-px w-6 bg-gold" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Admission Fee</p>
                  </div>
                  <PrintButton targetId="admission-fee" />
                </div>
                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
                  <Row label="Amount Paid" value={admission.amountPaid ? `₹${(admission.amountPaid / 100).toLocaleString("en-IN")}` : null} />
                  <Row label="Paid On" value={admission.paidAt ? new Date(admission.paidAt).toLocaleDateString() : null} />
                  <Row label="Payment ID" value={admission.razorpayPaymentId} />
                  <Row label="Batch" value={admission.batch.label} />
                </div>
              </Reveal>

              {/* official printed/downloaded document */}
              <div className="hidden print:block">
                <PrintLetterhead />
                <h1 className="font-display text-xl">Application Fee Receipt</h1>
                <dl className="mt-4 text-sm">
                  <PrintRow label="Application ID" value={admission.student.user.registrationNumber} />
                  <PrintRow label="Applicant Name" value={fullName} />
                  <PrintRow label="Batch" value={admission.batch.label} />
                  <PrintRow label="Amount Paid" value={admission.amountPaid ? `₹${(admission.amountPaid / 100).toLocaleString("en-IN")}` : null} />
                  <PrintRow label="Payment ID" value={admission.razorpayPaymentId} />
                  <PrintRow label="Paid On" value={admission.paidAt ? new Date(admission.paidAt).toLocaleDateString("en-IN") : null} />
                </dl>
                <p className="mt-6 text-xs">This is a system-generated receipt and does not require a signature.</p>
                <PrintFooter />
              </div>
            </div>
          )}

          {Array.from(paymentGroups.entries()).map(([groupKey, groupFees]) => {
            const totalPaise = groupFees.reduce((sum, f) => sum + f.amountPaise, 0);
            const first = groupFees[0];
            const heading = groupFees.length > 1 ? "Course Fee" : first.label;
            const receiptId = `fee-group-${groupKey}`;

            return (
              <div key={groupKey} data-receipt={receiptId} className="break-inside-avoid">
                <Reveal className="print:hidden">
                  <div className="mb-3 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <span aria-hidden="true" className="h-px w-6 bg-gold" />
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{heading}</p>
                    </div>
                    <PrintButton targetId={receiptId} />
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {groupFees.map((fee) => (
                      <div key={fee.id} className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-sm last:border-0">
                        <span className="text-body">
                          {fee.label} <span className="text-faint">· {fee.cycleLabel}</span>
                        </span>
                        <span className="font-semibold text-ink">₹{(fee.amountPaise / 100).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    <div className="grid grid-cols-1 gap-px bg-slate-200 sm:grid-cols-2">
                      <Row label="Total Paid" value={`₹${(totalPaise / 100).toLocaleString("en-IN")}`} />
                      <Row label="Paid On" value={first.paidAt ? new Date(first.paidAt).toLocaleDateString() : null} />
                    </div>
                    <div className="border-t border-slate-100">
                      <Row label="Payment ID" value={first.razorpayPaymentId} />
                    </div>
                  </div>
                </Reveal>

                {/* official printed/downloaded document */}
                <div className="hidden print:block">
                  <PrintLetterhead />
                  <h1 className="font-display text-xl">Course Fee Receipt</h1>
                  <dl className="mt-4 text-sm">
                    <PrintRow label="Applicant Name" value={fullName} />
                    <PrintRow label="Course" value={admission?.student.programme} />
                  </dl>
                  <p className="mb-2 mt-6 text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary">Fee Breakdown</p>
                  <dl className="text-sm">
                    {groupFees.map((fee) => (
                      <PrintRow key={fee.id} label={`${fee.label} (${fee.cycleLabel})`} value={`₹${(fee.amountPaise / 100).toLocaleString("en-IN")}`} />
                    ))}
                    <PrintRow label="Total Paid" value={`₹${(totalPaise / 100).toLocaleString("en-IN")}`} />
                    <PrintRow label="Payment ID" value={first.razorpayPaymentId} />
                    <PrintRow label="Paid On" value={first.paidAt ? new Date(first.paidAt).toLocaleDateString("en-IN") : null} />
                  </dl>
                  <p className="mt-6 text-xs">This is a system-generated receipt and does not require a signature.</p>
                  <PrintFooter />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
