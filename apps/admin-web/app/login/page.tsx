"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { requestAdminLogin } from "@/lib/auth/admin_auth_service";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await requestAdminLogin(email, password);

      sessionStorage.setItem("admin_login_email", email);

      setMessage(
        `${response.message} Check your ${response.otp_channel} for the code.`,
      );

      window.location.href = "/login/verify";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fa] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0054a6] text-white shadow-lg">
            <ShieldCheck size={32} />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-[#0b1f3f]">
            Compassion Admin
          </h1>

          <p className="mt-2 text-sm text-[#5c6672]">
            Sign in to the administration portal
          </p>
        </div>

        <div className="rounded-2xl border border-[#e0e4e8] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#0b1f3f]">
              Administrator sign in
            </h2>
            <p className="mt-1 text-sm text-[#5c6672]">
              Your login requires a one-time verification code.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-[#d64545]/20 bg-[#d64545]/5 px-4 py-3 text-sm text-[#d64545]">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-lg border border-[#2e8b57]/20 bg-[#2e8b57]/5 px-4 py-3 text-sm text-[#2e8b57]">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#1a1a1a]"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6672]"
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-lg border border-[#e0e4e8] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#1a1a1a]"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6672]"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-lg border border-[#e0e4e8] bg-white pl-10 pr-12 text-sm outline-none transition focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg bg-[#0054a6] px-4 text-sm font-semibold text-white transition hover:bg-[#00478d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/login/forgot-password"
              className="text-sm font-medium text-[#0054a6] hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#5c6672]">
          Compassion Administration Portal
        </p>
      </div>
    </main>
  );
}
