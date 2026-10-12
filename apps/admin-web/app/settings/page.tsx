"use client";

import AdminAuthGuard from "@/components/admin_auth_guard";
import AdminSidebar from "@/components/admin_sidebar";
import {
  getMyAdminProfile,
  updateMyAdminProfile,
  type AdminUser,
} from "@/lib/api/admin_api";
import {
  changeAdminPassword,
  requestPasswordChangeOtp,
} from "@/lib/auth/admin_auth_service";
import { getAdminSessionToken } from "@/lib/auth/admin_session";
import { Eye, EyeOff, Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<AdminUser | null>(null);
  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [designation, setDesignation] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordOtp, setPasswordOtp] = useState("");
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const data = await getMyAdminProfile();

        if (active) {
          setProfile(data);
          setName(data.name ?? "");
          setTelephone(data.telephone ?? "");
          setDesignation(data.designation ?? "");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your profile.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage(null);
      setError(null);

      const updated = await updateMyAdminProfile({
        name: name.trim(),
        telephone: telephone.trim() || null,
        designation: designation.trim() || null,
      });

      setProfile(updated);
      setName(updated.name ?? "");
      setTelephone(updated.telephone ?? "");
      setDesignation(updated.designation ?? "");
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    const token = getAdminSessionToken();

    if (!token) {
      setPasswordError(
        "Your admin session has expired. Please log in again.",
      );
      return;
    }

    try {
      setPasswordSaving(true);

      if (!passwordOtpSent) {
        const response = await requestPasswordChangeOtp(
          currentPassword,
          newPassword,
          token,
        );

        setPasswordMessage(response.message);
        setPasswordOtpSent(true);
      } else {
        if (!/^\d{6}$/.test(passwordOtp)) {
          setPasswordError("Enter the 6-digit verification code.");
          return;
        }

        const response = await changeAdminPassword(
          currentPassword,
          newPassword,
          passwordOtp,
          token,
        );

        setPasswordMessage(response.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordOtp("");
        setPasswordOtpSent(false);
      }
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : "Unable to update your password.",
      );
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <AdminAuthGuard>
      <AdminSidebar />

      <div className="lg:pl-64">
        <div className="min-h-screen bg-[#f5f7fa]">
          <main className="min-h-screen bg-[#f5f7fa]">
            <div className="mx-auto max-w-7xl px-6 py-8">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-[#0b1f3f]">
                  Admin Settings
                </h1>

                <p className="mt-1 text-sm text-[#5c6672]">
                  Manage your profile information and password.
                </p>
              </div>

              <div className="mx-auto max-w-4xl space-y-8">
                <section className="rounded-2xl border border-[#e0e4e8] bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-7">
                    <h2 className="text-xl font-semibold text-[#0b1f3f]">
                      Profile Information
                    </h2>

                    <p className="mt-1 text-sm text-[#5c6672]">
                      These details can appear in the report submission
                      section.
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
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-[#1a1a1a]"
                      >
                        Full Name
                      </label>

                      <input
                        id="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={loading || saving}
                        required
                        maxLength={100}
                        className="w-full rounded-lg border border-[#e0e4e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10 disabled:bg-[#f5f7fa]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-[#1a1a1a]"
                      >
                        Email
                      </label>

                      <input
                        id="email"
                        value={profile?.email ?? ""}
                        disabled
                        className="w-full rounded-lg border border-[#e0e4e8] bg-[#f5f7fa] px-4 py-3 text-sm text-[#5c6672]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="telephone"
                        className="mb-2 block text-sm font-medium text-[#1a1a1a]"
                      >
                        Telephone Number
                      </label>

                      <input
                        id="telephone"
                        value={telephone}
                        onChange={(event) =>
                          setTelephone(event.target.value)
                        }
                        disabled={loading || saving}
                        maxLength={20}
                        placeholder="Enter telephone number"
                        className="w-full rounded-lg border border-[#e0e4e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10 disabled:bg-[#f5f7fa]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="designation"
                        className="mb-2 block text-sm font-medium text-[#1a1a1a]"
                      >
                        Designation
                      </label>

                      <input
                        id="designation"
                        value={designation}
                        onChange={(event) =>
                          setDesignation(event.target.value)
                        }
                        disabled={loading || saving}
                        maxLength={50}
                        placeholder="e.g. Programme Manager"
                        className="w-full rounded-lg border border-[#e0e4e8] px-4 py-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10 disabled:bg-[#f5f7fa]"
                      />
                    </div>

                    <div className="flex justify-end border-t border-[#e0e4e8] pt-6">
                      <button
                        type="submit"
                        disabled={loading || saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0054a6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004586] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save size={18} />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </section>

                <section className="rounded-2xl border border-[#e0e4e8] bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-7">
                    <h2 className="text-xl font-semibold text-[#0b1f3f]">
                      Change Password
                    </h2>

                    <p className="mt-1 text-sm text-[#5c6672]">
                      Update your password using your current password.
                    </p>
                  </div>

                  {passwordError && (
                    <div className="mb-5 rounded-xl border border-[#d64545]/20 bg-[#d64545]/5 px-4 py-3 text-sm text-[#d64545]">
                      {passwordError}
                    </div>
                  )}

                  {passwordMessage && (
                    <div className="mb-5 rounded-xl border border-[#2e8b57]/20 bg-[#2e8b57]/5 px-4 py-3 text-sm text-[#2e8b57]">
                      {passwordMessage}
                    </div>
                  )}

                  <form
                    onSubmit={handlePasswordSubmit}
                    className="space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="current-password"
                        className="mb-2 block text-sm font-medium text-[#1a1a1a]"
                      >
                        Current Password
                      </label>

                      <div className="relative">
                        <input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(event) =>
                            setCurrentPassword(event.target.value)
                          }
                          required
                          disabled={passwordSaving}
                          className="w-full rounded-lg border border-[#e0e4e8] px-4 py-3 pr-12 text-sm text-[#1a1a1a] outline-none focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10 disabled:bg-[#f5f7fa]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword((visible) => !visible)
                          }
                          disabled={passwordSaving}
                          aria-label={
                            showCurrentPassword
                              ? "Hide current password"
                              : "Show current password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#5c6672] hover:text-[#0054a6]"
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={20} />
                          ) : (
                            <Eye size={20} />
                          )}
                        </button>
                      </div>
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
                          onChange={(event) =>
                            setNewPassword(event.target.value)
                          }
                          required
                          minLength={8}
                          disabled={passwordSaving}
                          className="w-full rounded-lg border border-[#e0e4e8] px-4 py-3 pr-12 text-sm text-[#1a1a1a] outline-none focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10 disabled:bg-[#f5f7fa]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword((visible) => !visible)
                          }
                          disabled={passwordSaving}
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
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          required
                          minLength={8}
                          disabled={passwordSaving}
                          className="w-full rounded-lg border border-[#e0e4e8] px-4 py-3 pr-12 text-sm text-[#1a1a1a] outline-none focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10 disabled:bg-[#f5f7fa]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((visible) => !visible)
                          }
                          disabled={passwordSaving}
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

                    {passwordOtpSent && (
                      <div className="rounded-xl border border-[#0054a6]/20 bg-[#0054a6]/5 p-4">
                        <label
                          htmlFor="password-otp"
                          className="mb-2 block text-sm font-medium text-[#1a1a1a]"
                        >
                          Email Verification Code
                        </label>

                        <p className="mb-3 text-xs text-[#5c6672]">
                          A 6-digit verification code was sent to your registered email address. The code expires in 5 minutes.
                        </p>

                        <input
                          id="password-otp"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          value={passwordOtp}
                          onChange={(event) =>
                            setPasswordOtp(
                              event.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          required
                          maxLength={6}
                          disabled={passwordSaving}
                          placeholder="Enter 6-digit code"
                          className="w-full rounded-lg border border-[#e0e4e8] px-4 py-3 text-sm tracking-[0.3em] text-[#1a1a1a] outline-none focus:border-[#0054a6] focus:ring-2 focus:ring-[#0054a6]/10 disabled:bg-[#f5f7fa]"
                        />
                      </div>
                    )}

                    <div className="flex justify-end border-t border-[#e0e4e8] pt-6">
                      <button
                        type="submit"
                        disabled={passwordSaving}
                        className="rounded-lg bg-[#0054a6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#004586] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {passwordSaving
                          ? passwordOtpSent
                            ? "Verifying..."
                            : "Sending Code..."
                          : passwordOtpSent
                            ? "Verify Code & Update Password"
                            : "Send Verification Code"}
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
