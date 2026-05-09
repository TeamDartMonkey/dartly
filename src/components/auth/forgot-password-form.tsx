"use client";

import { type SyntheticEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import type { ForgotPasswordFormData } from "@/types";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const values: ForgotPasswordFormData = {
      email: formData.get("email") as string,
    };

    if (!values.email.includes("@") || !values.email.includes(".")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      // Hit the server endpoint instead of calling Supabase directly so that
      // (a) IP rate-limiting and (b) the deliberate uniform-success response
      // (account-enumeration defense) take effect. We always show the success
      // state on a non-network response, regardless of whether the email is
      // actually registered.
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      if (res.status === 429) {
        setError("Too many requests — please wait a moment and try again.");
        return;
      }

      // The server responds 200 with a generic message regardless of whether
      // the email exists. Treat any 2xx as success.
      if (res.ok) {
        setSuccess(true);
        return;
      }

      // 4xx other than 429 means malformed input (e.g. invalid email format).
      const data = await res.json().catch(() => ({}) as { error?: string });
      setError(data.error || "Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-md bg-green-500/10 border border-green-500/20 px-3 py-2 text-sm text-green-400">
        A password reset link has been sent to your email.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <Input
        id="email"
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        {loading ? "Sending reset link..." : "Send Reset Link"}
      </button>
    </form>
  );
}
