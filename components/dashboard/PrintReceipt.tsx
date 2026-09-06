// Mirrors the official letterhead used for the admission fee receipt on
// ussu-web (DashboardHome.tsx PrintLetterhead/PrintFooter/PrintRow) so every
// receipt across both apps looks like the same document, not two designs.
export function PrintLetterhead() {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <img src="/logo-transparent.png" alt="" className="h-14 w-14 shrink-0" />
          <div>
            <p className="text-lg font-bold uppercase tracking-wide">Uttarakhand State Sports University</p>
            <p className="text-sm">उत्तराखण्ड राज्य खेल विश्वविद्यालय</p>
            <p className="text-xs italic text-muted">Manaskhand Khel Parisar, Gaulapar, Haldwani, Nainital – 263139, Uttarakhand</p>
          </div>
        </div>
        <div className="shrink-0 text-right text-xs">
          <p>Phone: +91 92590 19907</p>
          <p>Email: admissions@ukssu.ac.in</p>
          <p>Web: ukssu.ac.in</p>
        </div>
      </div>
      <div className="mt-2 h-0.5 w-full bg-primary" />
    </div>
  );
}

export function PrintFooter() {
  return (
    <>
      <style>{"@media print { @page { margin-bottom: 90px; } }"}</style>
      <div className="hidden print:fixed print:inset-x-0 print:bottom-0 print:block">
        <div className="h-0.5 w-full bg-primary" />
        <p className="mt-2 text-center text-[10px] text-muted">
          Manaskhand Khel Parisar, Gaulapar, Haldwani, Nainital – 263139, Uttarakhand &nbsp;|&nbsp; ukssu.ac.in
        </p>
      </div>
    </>
  );
}

export function PrintRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-200 py-1">
      <dt className="text-muted">{label}</dt>
      <dd className="font-semibold">{value ?? "—"}</dd>
    </div>
  );
}
