import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-ink">Profile</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between border-b border-slate-100 pb-2">
          <dt className="text-muted">Email</dt>
          <dd className="font-medium text-body">{user.email}</dd>
        </div>
        <div className="flex justify-between border-b border-slate-100 pb-2">
          <dt className="text-muted">Role</dt>
          <dd className="font-medium text-body">{user.role}</dd>
        </div>
      </dl>
    </div>
  );
}
