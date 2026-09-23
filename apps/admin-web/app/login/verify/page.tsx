"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { verifyAdminLoginOtp } from "@/lib/auth/admin_auth_service";

export default function AdminOtpPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("admin_login_email");

    if (!storedEmail) {
      window.location.href = "/login";
      return;
    }

    setEmail(storedEmail);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email) {
      setError("Your login session has expired. Please start again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyAdminLoginOtp(email, otp);

      if (response.requires_setup && response.setup_token) {
        sessionStorage.setItem("admin_setup_token", response.setup_token);
        window.location.href = "/login/first-login";
        return;
      }

      if (!response.session_token) {
        throw new Error("The server did not return a session token.");
      }

      sessionStorage.setItem("admin_session_token", response.session_token);

      if (response.refresh_token) {
        sessionStorage.setItem(
          "admin_refresh_token",
          response.refresh_token,
        );
      }

      sessionStorage.removeItem("admin_login_email");

      window.location.href = "/";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to verify the code. Please try again.",
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
            Verify your login
          </h1>

          <p className="mt-2 text-sm text-[#5c6672]">
            Enter the 6-digit code sent to your registered contact method.
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
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-[#1a1a1a]"
              >
                Verification code
              </label>

              <div className="relative">
                <KeyRound
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6672]"
                />

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, ""))
                  }
                  className="h-12 w-full rounded-lg border border-[#e0e4e8] bg-white pl-10 pr-4 text-center text-lg font-semibold tracking-[0.4em] outline-none transition focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10"
                  placeholder="000000"
                />
              </div>

              {email && (
                <p className="mt-2 text-xs text-[#5c6672]">
                  Verification for {email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg bg-[#0054a6] px-4 text-sm font-semibold text-white transition hover:bg-[#00478d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify and continue"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("admin_login_email");
              window.location.href = "/login";
            }}
            className="mx-auto mt-6 flex items-center gap-2 text-sm font-medium text-[#0054a6] hover:underline"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-[#5c6672]">
          Compassion Administration Portal
        </p>
      </div>
    </main>
  );
}
