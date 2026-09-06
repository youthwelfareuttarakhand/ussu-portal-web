import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { Reveal } from "@/components/Reveal";
import type { Admission } from "@/types/api";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white px-4 py-3">
      <dt className="text-[10.5px] uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value ?? "—"}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 max-w-2xl">
      <div className="mb-3 flex items-center gap-2.5">
        <span aria-hidden="true" className="h-px w-6 bg-gold" />
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{title}</p>
      </div>
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const admission = user.role === "STUDENT" ? await serverApiFetch<Admission>("/admissions/me") : null;
  const applicant = admission?.student;

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Profile</h2>

      <Reveal className="mt-4 max-w-2xl overflow-hidden rounded-2xl bg-primary-dark text-white shadow-lg shadow-primary-dark/20">
        <div aria-hidden="true" className="h-[3px] w-full bg-gold" />
        <div className="flex flex-wrap items-center justify-between gap-6 p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-gold/60 bg-white/5 font-display text-2xl text-gold">
              {(applicant?.user.fullName ?? user.email).charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-display text-xl uppercase tracking-wide text-white">
                {applicant?.user.fullName ?? user.email}
              </p>
              <p className="text-sm text-white/50">{user.email}</p>
              <span className="mt-2 inline-flex items-center rounded-full border border-gold/50 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-gold">
                {user.role}
              </span>
            </div>
          </div>

          {admission && (
            <div className="flex items-stretch divide-x divide-white/10 border-l border-white/10 pl-6">
              <div className="px-5 first:pl-0">
                <p className="text-[10.5px] uppercase tracking-wide text-white/40">UKSSU ID</p>
                <p className="mt-1 font-display text-base text-gold">{applicant?.user.ukssuId ?? "Pending"}</p>
              </div>
              <div className="px-5">
                <p className="text-[10.5px] uppercase tracking-wide text-white/40">Batch</p>
                <p className="mt-1 font-display text-base text-gold">{admission.batch.label}</p>
              </div>
            </div>
          )}
        </div>
      </Reveal>

      {admission && (
        <>
          <Section title="Applicant">
            <Row label="Full Name" value={applicant?.user.fullName} />
            <Row label="Phone" value={applicant?.user.phone} />
            <Row label="Date of Birth" value={applicant?.user.dob ? new Date(applicant.user.dob).toLocaleDateString() : null} />
            <Row label="Country" value={applicant?.country?.name} />
            <Row label="State" value={applicant?.state?.name} />
            <Row label="Programme" value={applicant?.programmeLevel} />
            <Row label="Course" value={applicant?.programme} />
            {admission.coachingDiscipline && <Row label="Discipline" value={admission.coachingDiscipline} />}
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

          {admission.documents.length > 0 && (
            <div className="mt-8 max-w-2xl">
              <div className="mb-3 flex items-center gap-2.5">
                <span aria-hidden="true" className="h-px w-6 bg-gold" />
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Documents</p>
              </div>
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
        </>
      )}

      {!admission && (
        <Reveal className="mt-4 max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 text-sm text-muted">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted">Email</dt>
                <dd className="font-medium text-body">{user.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Role</dt>
                <dd className="font-medium text-body">{user.role}</dd>
              </div>
            </dl>
          </div>
        </Reveal>
      )}
    </div>
  );
}
