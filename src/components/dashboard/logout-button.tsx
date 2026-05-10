"use client";

import { useState } from "react";

export function LogoutButton() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        // Parse the error body defensively — a 5xx may return non-JSON.
        const data = await res.json().catch(() => ({}) as { error?: string });
        setError(data.error ?? "Something went wrong.");
        return;
      }

      //using window.location.href instead of router.push to force a full page reload and clear any cookies/local storage
      window.location.href = "/login";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">Sign Out</h2>
          <p className="mt-1 text-sm text-zinc-400">
            End your current session and return to the login page.
          </p>
        </div>
        <button
          onClick={handleLogout}
          type="button"
          disabled={loading}
          className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {loading ? "Signing out..." : "Sign out"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
