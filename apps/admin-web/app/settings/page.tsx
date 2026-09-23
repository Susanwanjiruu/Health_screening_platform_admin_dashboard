"use client";

import AdminAuthGuard from "@/components/admin_auth_guard";
import {
  getMyAdminProfile,
  updateMyAdminProfile,
  type AdminUser,
} from "@/lib/api/admin_api";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminUser | null>(null);
  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [designation, setDesignation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        err instanceof Error ? err.message : "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[#f5f7fa]">
        <header className="border-b border-[#e0e4e8] bg-white">
          <div className="mx-auto flex h-20 max-w-4xl items-center gap-4 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-lg p-2 text-[#5c6672] hover:bg-[#f5f7fa] hover:text-[#0b1f3f]"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-lg font-semibold text-[#0b1f3f]">
                Admin Settings
              </h1>
              <p className="text-sm text-[#5c6672]">
                Manage your profile information used in reports.
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <section className="rounded-2xl border border-[#e0e4e8] bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <h2 className="text-xl font-semibold text-[#0b1f3f]">
                Profile Information
              </h2>
              <p className="mt-1 text-sm text-[#5c6672]">
                These details can appear in the report submission section.
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
                  onChange={(event) => setTelephone(event.target.value)}
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
                  onChange={(event) => setDesignation(event.target.value)}
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
        </main>
      </div>
    </AdminAuthGuard>
  );
}
