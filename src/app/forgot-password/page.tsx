import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main>
      <h1>Reset your password</h1>
      <p>Enter your email and we will send you a reset link.</p>
      <ForgotPasswordForm />
      <a href="/login">Back to login</a>
    </main>
  );
}
