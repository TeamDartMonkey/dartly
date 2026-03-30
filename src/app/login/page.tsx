import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main>
      <h1>Sign in</h1>
      <LoginForm />
      <p>
        Don't have an account? <a href="/register">Sign up</a>
      </p>
    </main>
  );
}
