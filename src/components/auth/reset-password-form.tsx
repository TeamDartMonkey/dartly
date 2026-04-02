"use client";

import { type SyntheticEvent, useEffect, useState } from "react";
import { createClient } from "@/services/supabase";
import type { ResetPasswordFormData } from "@/types";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("session:", session);
      if (session) {
        setSessionReady(true);
      } else {
        // Try exchanging the code as fallback
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
            if (error) {
              console.log("exchange error:", error);
              setError("Invalid or expired reset link.");
            } else {
              setSessionReady(true);
            }
          });
        } else {
          setError("Invalid or expired reset link.");
        }
      }
    });
  }, []);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
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

    if (!/[!@#$%^&*]/.test(values.password)) {
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
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      //log out user after password reset
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (error && !sessionReady) {
    return <p>{error}</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p>{error}</p>}

      <label htmlFor="password">New Password</label>
      <input id="password" name="password" type="password" placeholder="Password" />

      <label htmlFor="confirmPassword">Confirm New Password</label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
      />

      <button type="submit" disabled={loading}>
        {loading ? "Updating password..." : "Reset Password"}
      </button>
    </form>
  );
}
