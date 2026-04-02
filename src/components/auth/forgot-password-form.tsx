"use client";

import { type SyntheticEvent, useState } from "react";
import { createClient } from "@/services/supabase";
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
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return <p>A password reset link has been sent.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p>{error}</p>}

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="text" placeholder="Email" />

      <button type="submit" disabled={loading}>
        {loading ? "Sending reset link..." : "Send Reset Link"}
      </button>
    </form>
  );
}
