"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api";
import { EyebrowSwoosh } from "@/components/EyebrowSwoosh";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier: email, password }),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">USSU Portal</p>
      <EyebrowSwoosh />
      <h1 className="mt-3 font-display text-2xl uppercase tracking-wide text-ink">Sign in</h1>
      <p className="mt-1 text-sm text-muted">Student, staff &amp; admin access</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-body">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-body outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-body">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-body outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-muted"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-accent">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b from-accent to-accent-dark px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-accent/25 transition-transform hover:-translate-y-px disabled:opacity-60"
        >
          <span className="absolute inset-0 -translate-x-full bg-accent-dark transition-transform duration-300 ease-out group-hover:translate-x-0" />
          <span className="relative">{loading ? "Signing in…" : "Sign in"}</span>
        </button>
      </form>
    </div>
  );
}
