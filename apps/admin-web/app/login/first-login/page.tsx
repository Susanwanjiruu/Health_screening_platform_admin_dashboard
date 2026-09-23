"use client";

import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { completeAdminFirstLogin } from "@/lib/auth/admin_auth_service";

export default function AdminFirstLoginPage() {
  const [setupToken, setSetupToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("admin_setup_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setSetupToken(token);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!setupToken) {
      setError("Your setup session has expired. Please sign in again.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await completeAdminFirstLogin(
        setupToken,
        newPassword,
      );

      sessionStorage.removeItem("admin_setup_token");
      sessionStorage.setItem("admin_session_token", response.session_token);

      if (response.refresh_token) {
        sessionStorage.setItem(
          "admin_refresh_token",
          response.refresh_token,
        );
      }

      window.location.href = "/";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete account setup.",
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
            Set your new password
          </h1>

          <p className="mt-2 text-sm text-[#5c6672]">
            This is required before you can access the Compassion Admin
            Dashboard.
          </p>
        </div>

        <div className="rounded-2xl border border-[#e0e4e8] bg-white p-6 shadow-sm sm:p-8">
          {error && (
            <div className="mb-5 rounded-lg border border-[#d64545]/20 bg-[#d64545]/5 px-4 py-3 text-sm text-[#d64545]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium text-[#1a1a1a]"
              >
                New password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6672]"
                />

                <input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="h-12 w-full rounded-lg border border-[#e0e4e8] bg-white pl-10 pr-12 text-sm outline-none transition focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10"
                  placeholder="Enter a new password"
                />

                <button
                  type="button"
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
                >
                  {showNewPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-[#1a1a1a]"
              >
                Confirm new password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6672]"
                />

                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  className="h-12 w-full rounded-lg border border-[#e0e4e8] bg-white pl-10 pr-12 text-sm outline-none transition focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10"
                  placeholder="Confirm your new password"
                />

                <button
                  type="button"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-[#5c6672]">
              Your password must contain at least 8 characters. The backend
              will perform the final password-strength validation.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg bg-[#0054a6] px-4 text-sm font-semibold text-white transition hover:bg-[#00478d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving password..." : "Complete setup"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#5c6672]">
          Compassion Administration Portal
        </p>
      </div>
    </main>
  );
}
