import { cache } from "react";
import { cookies } from "next/headers";
import type { SessionUser } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SESSION_COOKIE = "ussu_token";

// React's cache() dedupes calls with the same arguments within one request —
// the dashboard layout and nearly every page under it each called this,
// which meant a redundant /auth/me round trip per navigation on top of the
// layout's own call. Wrapping it means only one network call per request.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE);
  if (!token) return null;

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { cookie: `${SESSION_COOKIE}=${token.value}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as SessionUser;
});

export { SESSION_COOKIE };
