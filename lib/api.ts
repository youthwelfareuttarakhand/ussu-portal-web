// Browser calls stay same-origin (/api/*) so the Next.js rewrite in next.config.js
// proxies to the backend server-side — that's what makes Set-Cookie land on this
// domain instead of the API's, which is what the dashboard middleware checks.
const API_URL = "/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let refreshing: Promise<boolean> | null = null;

async function refresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((r) => r.ok)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

/** Thin fetch wrapper: cookie-based auth, one 401->refresh retry, typed errors. */
export async function apiFetch<T>(path: string, opts: RequestInit = {}, _retried = false): Promise<T> {
  // FormData bodies (file uploads) must NOT get a manual Content-Type — the
  // browser sets its own multipart boundary. Only default to JSON otherwise.
  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...opts.headers,
    },
  });

  if (res.status === 401 && !_retried) {
    const ok = await refresh();
    if (ok) return apiFetch<T>(path, opts, true);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
