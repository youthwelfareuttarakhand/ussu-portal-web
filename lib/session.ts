import { cache } from "react";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { SessionUser } from "./auth";

const SESSION_COOKIE = "ussu_token";
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

// Verifies the session cookie locally (same secret ussu-api signs with)
// instead of round-tripping to /auth/me over the network. That network call
// ran on every single navigation for every role — a real, measurable chunk
// of felt latency on staging/production once cold-starts and DB region were
// ruled out. jwt.verify() checks signature + expiry; a forged/expired/
// tampered cookie throws and this returns null, same as a failed /auth/me
// call did.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE);
  if (!token || !JWT_ACCESS_SECRET) return null;

  try {
    const payload = jwt.verify(token.value, JWT_ACCESS_SECRET) as SessionUser;
    return payload;
  } catch {
    return null;
  }
});

export { SESSION_COOKIE };
