"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { requestPasswordReset } from "@/lib/auth/admin_auth_service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage(null);
    setError(null);

    try {
      setLoading(true);

      const response = await requestPasswordReset(email.trim());

      setMessage(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process your password reset request.",
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
              <Mail size={24} />
            </div>

            <h1 className="text-2xl font-semibold text-[#0b1f3f]">
              Forgot Password?
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#5c6672]">
              Enter the email address associated with your administrator
              account. We&apos;ll send you a password reset link.
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
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#1a1a1a]"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder="Enter your email address"
                disabled={loading}
                className="w-full rounded-lg border border-[#e0e4e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10 disabled:bg-[#f5f7fa]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0054a6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004586] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} />
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-[#5c6672]">
            If an account with that email exists, a reset link will be sent.
          </p>
        </section>
      </div>
    </main>
  );
}
