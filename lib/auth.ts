import type { Role } from "./roles";

export type SessionUser = {
  sub: string;
  email: string;
  role: Role;
  exp: number;
};

// ponytail: client-side decode is for UI branching only (which nav items to show).
// It is never the auth boundary — every guarded API route re-checks the httpOnly
// cookie + role server-side regardless of what this returns.
export function decodeJwtPayload(token: string): SessionUser | null {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as SessionUser;
  } catch {
    return null;
  }
}

export function isExpired(user: Pick<SessionUser, "exp">): boolean {
  return Date.now() >= user.exp * 1000;
}
