import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Server Component data fetcher: forwards the httpOnly session cookie to ussu-api. */
export async function serverApiFetch<T>(path: string): Promise<T | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE);
  if (!token) return null;

  const res = await fetch(`${API_URL}${path}`, {
    headers: { cookie: `${SESSION_COOKIE}=${token.value}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}
