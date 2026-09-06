import { cache } from "react";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// React's cache() dedupes calls with the same path within one request — the
// dashboard layout's portal-access gate and the page it renders often fetch
// the same endpoint (e.g. /admissions/me) independently, which meant a
// redundant network round trip per navigation on top of an already-slow
// remote DB. Same fix as getSessionUser in session.ts.
export const serverApiFetch = cache(async function serverApiFetch<T>(path: string): Promise<T | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE);
  if (!token) return null;

  const res = await fetch(`${API_URL}${path}`, {
    headers: { cookie: `${SESSION_COOKIE}=${token.value}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
});
