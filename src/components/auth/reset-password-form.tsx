"use client";

import { type SyntheticEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/services/supabase";
import type { ResetPasswordFormData } from "@/types";

type SessionState = "loading" | "ready" | "invalid";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionState, setSessionState] = useState<SessionState>("loading");

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;

      if (session) {
        setSessionState("ready");
        return;
      }

      const code = new URLSearchParams(window.location.search).get("code");
      if (!code) {
        if (!cancelled) {
          setSessionState("invalid");
          setError("Invalid or expired reset link.");
        }
        return;
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (cancelled) return;
      if (exchangeError) {
        setSessionState("invalid");
        setError("Invalid or expired reset link.");
      } else {
        setSessionState("ready");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sessionState !== "ready" || loading) return;
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const values: ResetPasswordFormData = {
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    if (values.password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(values.password)) {
      setError("Password must contain at least one uppercase letter.");
      setLoading(false);
      return;
    }
    if (!/[a-z]/.test(values.password)) {
      setError("Password must contain at least one lowercase letter.");
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(values.password)) {
      setError("Password must contain at least one number.");
      setLoading(false);
      return;
    }
    // Broadened from a fixed allowlist to "any non-alphanumeric" so common
    // strong characters (underscore, hyphen, plus, etc.) are accepted.
    if (!/[^A-Za-z0-9]/.test(values.password)) {
      setError("Password must contain at least one special character.");
      setLoading(false);
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Log out user after password reset
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sessionState === "loading") {
    return <p className="text-sm text-zinc-400">Verifying reset link…</p>;
  }

  if (sessionState === "invalid") {
    return (
      <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
        {error ?? "Invalid or expired reset link."}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        id="password"
        label="New Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
      />
      <Input
        id="confirmPassword"
        label="Confirm New Password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
      />

      <button
        type="submit"
        disabled={loading || sessionState !== "ready"}
        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        {loading ? "Updating password..." : "Reset Password"}
      </button>
    </form>
  );
}
