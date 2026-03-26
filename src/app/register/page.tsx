import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main>
      <h1>Create an account</h1>
      <RegisterForm />
      <p>
        Already have an account? <a href="/login">Sign in</a>
      </p>
    </main>
  );
}
