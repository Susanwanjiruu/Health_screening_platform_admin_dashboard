"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth/admin_auth_service";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token") ?? "";
  const [token, setToken] = useState(urlToken);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(null);
    setError(null);

    if (!token) {
      setError("This password reset link is missing its reset token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword(token, newPassword);

      setMessage(response.message);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset your password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <section className="w-full rounded-2xl border border-[#e0e4e8] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7">
            <Link
              href="/login"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#0054a6] hover:text-[#004586]"
            >
              <ArrowLeft size={17} />
              Back to Login
            </Link>

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0054a6]/10 text-[#0054a6]">
              <Lock size={24} />
            </div>

            <h1 className="text-2xl font-semibold text-[#0b1f3f]">
              Reset Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#5c6672]">
              Enter a new password for your administrator account.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-[#d64545]/20 bg-[#d64545]/5 px-4 py-3 text-sm text-[#d64545]">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-xl border border-[#2e8b57]/20 bg-[#2e8b57]/5 px-4 py-3 text-sm text-[#2e8b57]">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="reset-token"
                className="mb-2 block text-sm font-medium text-[#1a1a1a]"
              >
                Reset Token
              </label>

              <input
                id="reset-token"
                type="text"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                required
                disabled={loading}
                placeholder="Paste the reset token from your email"
                className="w-full rounded-lg border border-[#e0e4e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10 disabled:bg-[#f5f7fa]"
              />

              <p className="mt-1.5 text-xs text-[#5c6672]">
                Paste the reset token you received in the password reset email.
              </p>
            </div>
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium text-[#1a1a1a]"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-[#e0e4e8] px-4 py-3 pr-12 text-sm text-[#1a1a1a] outline-none focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10 disabled:bg-[#f5f7fa]"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((visible) => !visible)}
                  disabled={loading}
                  aria-label={
                    showNewPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5c6672] hover:text-[#0054a6]"
                >
                  {showNewPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              <p className="mt-1.5 text-xs text-[#5c6672]">
                Minimum 8 characters.
              </p>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-[#1a1a1a]"
              >
                Confirm New Password
              </label>

              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-lg border border-[#e0e4e8] px-4 py-3 pr-12 text-sm text-[#1a1a1a] outline-none focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10 disabled:bg-[#f5f7fa]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((visible) => !visible)
                  }
                  disabled={loading}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5c6672] hover:text-[#0054a6]"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-lg bg-[#0054a6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004586] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#f5f7fa] px-4 py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
          <div className="text-sm text-[#5c6672]">
            Loading password reset...
          </div>
        </div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
