import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { Reveal } from "@/components/Reveal";
import { StatusBadge } from "@/components/dashboard/DataTable";
import { AdmissionReviewActions } from "@/components/dashboard/AdmissionReviewActions";
import { FeeReceipts } from "@/components/dashboard/FeeReceipts";
import type { Admission, FeeStructureRow } from "@/types/api";

const CADENCE_LABEL: Record<FeeStructureRow["cadence"], string> = {
  SEMESTER: "Per Semester",
  YEAR: "Per Year",
};

const formatRupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value ?? "—"}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary">{title}</p>
      <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">{children}</dl>
    </div>
  );
}

export default async function AdmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "STUDENT") redirect("/unauthorized");

  const { id } = await params;
  const admission = await serverApiFetch<Admission>(`/admissions/${id}`);
  if (!admission) notFound();

  const applicant = admission.student;
  const fees = (await serverApiFetch<FeeStructureRow[]>(`/fees/student/${applicant.id}`)) ?? [];
  const feeTotalDuePaise = fees.filter((f) => f.status === "UNPAID").reduce((sum, f) => sum + f.amountPaise, 0);

  return (
    <div>
      {/* Everything except the fee receipts is screen-only — printing this page
          is meant to produce just the receipt document, not the full applicant
          record. */}
      <div className="print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg uppercase tracking-wide text-ink">{applicant.user.fullName}</h2>
          <p className="text-sm text-muted">{applicant.user.email}</p>
        </div>
        <StatusBadge status={admission.status} />
      </div>

      {admission.paid && <AdmissionReviewActions admissionId={admission.id} status={admission.status} />}

      <Reveal>
        <Section title="Applicant">
          <Row label="Full Name" value={applicant.user.fullName} />
          <Row label="Email" value={applicant.user.email} />
          <Row label="Phone" value={applicant.user.phone} />
          <Row label="Date of Birth" value={applicant.user.dob ? new Date(applicant.user.dob).toLocaleDateString() : null} />
          <Row label="Registration No." value={applicant.user.registrationNumber} />
          <Row label="UKSSU ID" value={applicant.user.ukssuId} />
          <Row label="Country" value={applicant.country?.name} />
          <Row label="State" value={applicant.state?.name} />
          <Row label="Programme" value={applicant.programmeLevel} />
          <Row label="Course" value={applicant.programme} />
          {admission.coachingDiscipline && <Row label="Discipline" value={admission.coachingDiscipline} />}
          <Row label="Batch" value={admission.batch.label} />
        </Section>

        <Section title="Personal Details">
          <Row label="Nationality" value={admission.nationality} />
          <Row label="Uttarakhand Domicile" value={admission.uttarakhandDomicile === null ? null : admission.uttarakhandDomicile ? "Yes" : "No"} />
          <Row label="Aadhar Number" value={admission.aadharNumber} />
          <Row label="Category" value={admission.category} />
          <Row label="Gender" value={admission.gender} />
          <Row label="Blood Group" value={admission.bloodGroup} />
          <Row label="Medium of Instruction" value={admission.mediumOfInstruction} />
          <Row label="Hostel Required" value={admission.hostelRequired === null ? null : admission.hostelRequired ? "Yes" : "No"} />
          <Row label="Discipline" value={admission.coachingDiscipline} />
        </Section>

        <Section title="Parent Details">
          <Row label="Father's Name" value={admission.parentDetails?.fatherName} />
          <Row label="Mother's Name" value={admission.parentDetails?.motherName} />
          <Row label="Guardian's Name" value={admission.parentDetails?.guardianName} />
          <Row label="Guardian Phone" value={admission.parentDetails?.guardianPhone} />
          <Row label="Guardian Email" value={admission.parentDetails?.guardianEmail} />
          <Row label="Occupation" value={admission.parentDetails?.occupation} />
        </Section>

        <Section title="Address Details">
          <Row
            label="Correspondence Address"
            value={[admission.addressDetails?.line1, admission.addressDetails?.line2, admission.addressDetails?.city, admission.addressDetails?.state, admission.addressDetails?.pincode].filter(Boolean).join(", ") || null}
          />
        </Section>

        <Section title="Academic Details">
          <Row label="10th Board" value={admission.academicDetails?.tenthBoard} />
          <Row label="10th Roll No." value={admission.academicDetails?.tenthRollNo} />
          <Row label="10th Year / %" value={admission.academicDetails?.tenthYear ? `${admission.academicDetails.tenthYear} / ${admission.academicDetails.tenthPercentage ?? "—"}%` : null} />
          <Row label="12th Board" value={admission.academicDetails?.twelfthBoard} />
          <Row label="12th Stream" value={admission.academicDetails?.twelfthStream} />
          <Row label="12th Year / %" value={admission.academicDetails?.twelfthYear ? `${admission.academicDetails.twelfthYear} / ${admission.academicDetails.twelfthPercentage ?? "—"}%` : null} />
          <Row label="Gap Year" value={admission.academicDetails?.gapYear === null ? null : admission.academicDetails?.gapYear ? "Yes" : "No"} />
          {admission.academicDetails?.graduationDiscipline && (
            <>
              <Row label="Graduation Discipline" value={admission.academicDetails.graduationDiscipline} />
              <Row label="Graduation Institution" value={admission.academicDetails.graduationInstitution} />
              <Row label="Graduation Status" value={admission.academicDetails.graduationStatus === "APPEARING" ? "Appearing" : admission.academicDetails.graduationStatus === "PASSED" ? "Passed" : null} />
              <Row
                label="Graduation Year / %"
                value={
                  admission.academicDetails.graduationYear
                    ? `${admission.academicDetails.graduationYear} / ${admission.academicDetails.graduationStatus === "APPEARING" ? "Appearing" : (admission.academicDetails.graduationPercentage ?? "—")}${admission.academicDetails.graduationStatus === "APPEARING" ? "" : "%"}`
                    : null
                }
              />
            </>
          )}
        </Section>

        <Section title="Sports Achievement">
          <Row label="Primary Sport" value={admission.sportsDetails?.primarySport} />
          <Row label="Highest Level" value={admission.sportsDetails?.highestLevel} />
          <Row label="Position Held" value={admission.sportsDetails?.positionHeld} />
          <Row label="Certifying Authority" value={admission.sportsDetails?.certifyingAuthority} />
          <Row label="Year of Achievement" value={admission.sportsDetails?.yearOfAchievement} />
          <Row label="Eminent Sportsperson" value={admission.sportsDetails?.eminentSportsperson === null ? null : admission.sportsDetails?.eminentSportsperson ? "Yes" : "No"} />
        </Section>

        <Section title="Payment">
          <Row label="Paid" value={admission.paid ? "Yes" : "No"} />
          <Row label="Amount Paid" value={admission.amountPaid ? `₹${(admission.amountPaid / 100).toLocaleString("en-IN")}` : null} />
          <Row label="Payment ID" value={admission.razorpayPaymentId} />
          <Row label="Paid On" value={admission.paidAt ? new Date(admission.paidAt).toLocaleDateString() : null} />
        </Section>

        <div className="mt-6">
          <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary">Course Fee</p>
          {fees.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-muted">
              No fee structure is set up for this student&apos;s course.
            </p>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-primary-dark text-left text-[11px] uppercase tracking-wide text-white">
                      <th className="px-4 py-2.5 font-semibold">Fee Head</th>
                      <th className="px-4 py-2.5 font-semibold">Billing Cycle</th>
                      <th className="px-4 py-2.5 font-semibold">Cadence</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {fees.map((fee) => (
                      <tr key={fee.id}>
                        <td className="px-4 py-2.5 font-semibold text-ink">
                          {fee.label}
                          {fee.amountPaise === 0 && (
                            <span className="ml-2 text-[10.5px] font-normal uppercase tracking-wide text-faint">Not opted</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-muted">{fee.cycleLabel}</td>
                        <td className="px-4 py-2.5 text-muted">{CADENCE_LABEL[fee.cadence]}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-ink">{formatRupees(fee.amountPaise)}</td>
                        <td className="px-4 py-2.5 text-right">
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
                      <td className="px-4 py-2.5 font-display uppercase tracking-wide text-ink" colSpan={3}>
                        Total Due
                      </td>
                      <td colSpan={2} className="px-4 py-2.5 text-right font-display text-base text-ink">
                        {formatRupees(feeTotalDuePaise)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>

        {admission.documents.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary">Documents</p>
            <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-4">
              {admission.documents.map((doc) => {
                const fileUrl = `/api/admissions/${admission.id}/documents/${doc.id}/file`;
                return (
                  <span
                    key={doc.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 pl-3 pr-1.5 py-1 text-xs font-semibold text-primary"
                  >
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {doc.type.replace("_", " ")}
                    </a>
                    <a
                      href={`${fileUrl}?download=1`}
                      title={`Download ${doc.filename}`}
                      className="rounded-full px-1.5 py-0.5 text-primary/70 transition-colors hover:bg-primary/20 hover:text-primary"
                    >
                      ↓
                    </a>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </Reveal>
      </div>

      {fees.some((f) => f.status === "PAID") && (
        <div className="mt-6 print:mt-0">
          <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary print:hidden">Fee Receipts</p>
          <FeeReceipts admission={admission} fees={fees} />
        </div>
      )}
    </div>
  );
}
