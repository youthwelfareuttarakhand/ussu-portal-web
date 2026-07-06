export default function UnauthorizedPage() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
      <p className="text-lg font-semibold text-ink">Not authorized</p>
      <p className="mt-1 text-sm text-muted">Your role doesn't have access to this page.</p>
    </div>
  );
}
