"use client";

import { useRouter } from "next/navigation";
import { type SyntheticEvent, useState } from "react";
import type { LoginFormData } from "@/types";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const values: LoginFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    //client side validation
    if (!values.email.includes("@") || !values.email.includes(".")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!values.password) {
      setError("Password is required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p>{error}</p>}

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="text" placeholder="Email" />

      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" placeholder="Password" />

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
