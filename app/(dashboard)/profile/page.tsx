import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { Reveal } from "@/components/Reveal";

const ROLE_BADGE_CLASS: Record<string, string> = {
  STUDENT: "bg-primary/10 text-primary",
  STAFF: "bg-gold/15 text-gold",
  ADMIN: "bg-accent/10 text-accent",
};

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Profile</h2>
      <Reveal className="mt-4 max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div aria-hidden="true" className="h-1 w-full bg-gradient-to-r from-primary via-primary to-accent" />
        <div className="flex items-center gap-4 p-6">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold uppercase text-white">
            {user.email.charAt(0)}
          </span>
          <div>
            <p className="font-semibold text-ink">{user.email}</p>
            <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE_CLASS[user.role]}`}>
              {user.role}
            </span>
          </div>
        </div>
        <dl className="space-y-3 border-t border-slate-100 p-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Email</dt>
            <dd className="font-medium text-body">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Role</dt>
            <dd className="font-medium text-body">{user.role}</dd>
          </div>
        </dl>
      </Reveal>
    </div>
  );
}
