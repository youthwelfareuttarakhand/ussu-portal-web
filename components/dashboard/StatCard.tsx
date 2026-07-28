import type { LucideIcon } from "lucide-react";

const GRADIENTS = {
  primary: "from-primary to-primary-dark",
  accent: "from-accent to-accent-dark",
  gold: "from-gold to-accent-dark",
} as const;

export function StatCard({
  label,
  value,
  tone = "primary",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  tone?: keyof typeof GRADIENTS;
  icon?: LucideIcon;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${GRADIENTS[tone]} p-5 text-white shadow-md transition-transform hover:-translate-y-1.5 hover:shadow-lg`}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      {Icon && (
        <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
          <Icon size={18} />
        </span>
      )}
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}
