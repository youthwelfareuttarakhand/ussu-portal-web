const GRADIENTS = {
  primary: "from-primary to-primary-dark",
  accent: "from-accent to-accent-dark",
} as const;

export function StatCard({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  tone?: keyof typeof GRADIENTS;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${GRADIENTS[tone]} p-5 text-white shadow-md transition hover:-translate-y-1.5 hover:shadow-lg`}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
