"use client";

import { useRouter } from "next/navigation";
import { type SyntheticEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import type { RegisterFormData } from "@/types";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const values: RegisterFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    //client side validation
    if (!values.email.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

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

    //pushing to API
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push("/profile");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        required
        placeholder="you@example.com"
      />
      <Input
        id="password"
        label="Password"
        name="password"
        type="password"
        required
        placeholder="••••••••"
      />
      <Input
        id="confirmPassword"
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        required
        placeholder="••••••••"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        {loading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}
