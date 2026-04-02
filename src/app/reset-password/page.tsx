import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main>
      <h1>Set a new password</h1>
      <ResetPasswordForm />
      <a href="/login">Back to login</a>
    </main>
  );
}
