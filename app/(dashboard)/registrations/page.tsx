import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { serverApiFetch } from "@/lib/server-api";
import { RegistrationsTable } from "@/components/dashboard/RegistrationsTable";
import type { Student } from "@/types/api";

export default async function RegistrationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "STUDENT") redirect("/unauthorized");

  const registrations = (await serverApiFetch<Student[]>("/students/registrations")) ?? [];

  return (
    <div>
      <h2 className="font-display text-lg uppercase tracking-wide text-ink">Registrations</h2>
      <p className="mt-1 text-sm text-muted">Everyone who has registered, regardless of admission progress.</p>
      <RegistrationsTable registrations={registrations} />
    </div>
  );
}
