import { cookies } from "next/headers";
import type { SessionUser } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const SESSION_COOKIE = "ussu_token";

/** Server-side only: forwards the httpOnly session cookie to ussu-api's /auth/me. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE);
  if (!token) return null;

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { cookie: `${SESSION_COOKIE}=${token.value}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as SessionUser;
}

export { SESSION_COOKIE };
