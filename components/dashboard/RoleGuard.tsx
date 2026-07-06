"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/roles";

/**
 * UX-only guard: hides a page from roles that shouldn't see it and redirects
 * to /unauthorized. Not the trust boundary — ussu-api re-checks role on every
 * guarded endpoint regardless of what this component does.
 */
export function RoleGuard({
  role,
  allow,
  children,
}: {
  role: Role;
  allow: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const permitted = allow.includes(role);

  useEffect(() => {
    if (!permitted) router.replace("/unauthorized");
  }, [permitted, router]);

  if (!permitted) return null;
  return <>{children}</>;
}
