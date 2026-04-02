import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-indigo-500 rounded-sm" />
              <div className="absolute top-1 left-1 right-0 bottom-0 border-2 border-indigo-300 rounded-sm" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-zinc-50">dartly</span>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-50">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-400">Welcome back. Enter your credentials below.</p>
        </div>

        <LoginForm />

        <div className="mt-6 space-y-3 text-center text-sm">
          <p className="text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
          <Link
            href="/forgot-password"
            className="block text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
