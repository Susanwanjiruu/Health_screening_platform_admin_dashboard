"use client";

import AdminAuthGuard from "@/components/admin_auth_guard";
import AdminSidebar from "@/components/admin_sidebar";
import { AdminUser, Facility, createProvider, getAdminUsers, getFacilities, setProviderLeader, toggleProviderStatus, updateProvider } from "@/lib/api/admin_api";
import { AlertCircle, Ban, Building2, MoreHorizontal, Plus, ShieldCheck, Stethoscope, UserCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProvidersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AdminUser | null>(null);
  const [showProviderDetails, setShowProviderDetails] = useState(false);
  const [showEditProvider, setShowEditProvider] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    telephone: "",
    designation: "",
    facility_id: "",
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    telephone: "",
    designation: "",
    facility_id: "",
    is_hospital_leader: false,
  });

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [userData, facilityData] = await Promise.all([
          getAdminUsers(),
          getFacilities(),
        ]);

        if (active) {
          setUsers(userData);
          setFacilities(facilityData);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load providers.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const facilityNames = useMemo(
    () =>
      new Map(
        facilities.map((facility) => [
          facility.facility_id,
          facility.name,
        ]),
      ),
    [facilities],
  );

  const providers = users.filter(
    (user) => user.role.toLowerCase() === "provider",
  );

  return (
    <AdminAuthGuard>
      <AdminSidebar />
      <div className="lg:pl-64">
      <main className="min-h-screen bg-[#f5f7fa]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-[#0b1f3f]">
                Providers
              </h1>
              <p className="mt-1 text-sm text-[#5c6672]">
                View provider accounts, facility assignments, leadership status,
                and account status.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreateForm(true);
                setCreateError(null);
                setCreateSuccess(null);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0054a6] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#004687]"
            >
              <Plus size={18} />
              Create Provider
            </button>
          </div>

          {showCreateForm && (
            <section className="mb-6 rounded-2xl border border-[#e0e4e8] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#0b1f3f]">
                    Create Provider
                  </h2>
                  <p className="mt-1 text-sm text-[#5c6672]">
                    Register a provider and assign them to a facility.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateError(null);
                    setCreateSuccess(null);
                  }}
                  className="rounded-lg p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
                  aria-label="Close create provider form"
                >
                  <X size={20} />
                </button>
              </div>

              {createError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {createError}
                </div>
              )}

              {createSuccess && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {createSuccess}
                </div>
              )}

              <form
                onSubmit={async (event) => {
                  event.preventDefault();

                  if (!form.facility_id) {
                    setCreateError("Please select a facility.");
                    return;
                  }

                  try {
                    setCreating(true);
                    setCreateError(null);
                    setCreateSuccess(null);

                    const created = await createProvider({
                      name: form.name.trim(),
                      email: form.email.trim(),
                      telephone: form.telephone.trim() || null,
                      designation: form.designation.trim() || null,
                      facility_id: Number(form.facility_id),
                      is_hospital_leader: form.is_hospital_leader,
                    });

                    setUsers((current) => [...current, created]);
                    setCreateSuccess(
                      "Provider created successfully. Their login credentials have been sent to their email address.",
                    );
                    setForm({
                      name: "",
                      email: "",
                      telephone: "",
                      designation: "",
                      facility_id: "",
                      is_hospital_leader: false,
                    });
                  } catch (err) {
                    setCreateError(
                      err instanceof Error
                        ? err.message
                        : "Unable to create provider.",
                    );
                  } finally {
                    setCreating(false);
                  }
                }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-[#0b1f3f]">
                      Full Name
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                      placeholder="Provider full name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#0b1f3f]">
                      Email
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                      placeholder="provider@example.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#0b1f3f]">
                      Telephone
                    </label>
                    <input
                      value={form.telephone}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          telephone: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                      placeholder="Phone number"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#0b1f3f]">
                      Designation
                    </label>
                    <input
                      value={form.designation}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          designation: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                      placeholder="Doctor, Nurse, Clinical Officer..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#0b1f3f]">
                      Facility
                    </label>
                    <select
                      required
                      value={form.facility_id}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          facility_id: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-lg border border-[#e0e4e8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                    >
                      <option value="">Select facility</option>
                      {facilities.map((facility) => (
                        <option
                          key={facility.facility_id}
                          value={facility.facility_id}
                        >
                          {facility.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium text-[#0b1f3f]">
                    <input
                      type="checkbox"
                      checked={form.is_hospital_leader}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          is_hospital_leader: event.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    Designate as Lead Provider
                  </label>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-lg bg-[#0054a6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004687] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {creating ? "Creating..." : "Create Provider"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
              <AlertCircle className="mt-0.5 shrink-0" size={20} />
              <div>
                <p className="font-semibold">Unable to load providers</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          )}

          <section className="mb-6 grid gap-5 sm:grid-cols-3">
            <div className="rounded-xl border border-[#e0e4e8] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#5c6672]">
                    Total Providers
                  </p>
                  <p className="mt-2 text-3xl font-bold text-[#0b1f3f]">
                    {loading ? "…" : providers.length}
                  </p>
                </div>
                <div className="rounded-lg bg-[#0054a6]/10 p-3 text-[#0054a6]">
                  <Stethoscope size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#e0e4e8] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#5c6672]">
                    Lead Providers
                  </p>
                  <p className="mt-2 text-3xl font-bold text-[#0b1f3f]">
                    {loading
                      ? "…"
                      : providers.filter((user) => user.is_hospital_leader)
                          .length}
                  </p>
                </div>
                <div className="rounded-lg bg-[#0054a6]/10 p-3 text-[#0054a6]">
                  <ShieldCheck size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#e0e4e8] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#5c6672]">
                    Facilities
                  </p>
                  <p className="mt-2 text-3xl font-bold text-[#0b1f3f]">
                    {loading ? "…" : facilities.length}
                  </p>
                </div>
                <div className="rounded-lg bg-[#0054a6]/10 p-3 text-[#0054a6]">
                  <Building2 size={21} />
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#e0e4e8] bg-white shadow-sm">
            <div className="border-b border-[#e0e4e8] px-6 py-5">
              <h2 className="text-lg font-semibold text-[#0b1f3f]">
                Provider Accounts
              </h2>
              <p className="mt-1 text-sm text-[#5c6672]">
                Providers registered in the Compassion platform.
              </p>
            </div>

            {actionError && (
              <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#f5f7fa]">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-[#5c6672]">
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Facility</th>
                    <th className="px-6 py-4">Leadership</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e0e4e8]">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-sm text-[#5c6672]"
                      >
                        Loading providers...
                      </td>
                    </tr>
                  ) : providers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-10 text-center text-sm text-[#5c6672]"
                      >
                        No provider accounts found.
                      </td>
                    </tr>
                  ) : (
                    providers.map((provider) => (
                      <tr
                        key={provider.user_id}
                        className="text-sm text-[#1a1a1a] hover:bg-[#f5f7fa]"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#0b1f3f]">
                            {provider.name}
                          </div>
                          <div className="mt-1 text-xs text-[#5c6672]">
                            {provider.designation || "Provider"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-[#5c6672]">
                          {provider.email}
                        </td>

                        <td className="px-6 py-4">
                          {provider.facility_id
                            ? facilityNames.get(provider.facility_id) ||
                              `Facility #${provider.facility_id}`
                            : "Not assigned"}
                        </td>

                        <td className="px-6 py-4">
                          {provider.is_hospital_leader ? (
                            <span className="inline-flex rounded-full bg-[#0054a6]/10 px-3 py-1 text-xs font-semibold text-[#0054a6]">
                              Lead Provider
                            </span>
                          ) : (
                            <span className="text-[#5c6672]">
                              Provider
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              provider.status.toLowerCase() === "active"
                                ? "bg-green-50 text-green-700"
                                : provider.status.toLowerCase() === "banned"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {provider.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={actionLoading === provider.user_id}
                              title={
                                provider.is_hospital_leader
                                  ? "Remove Lead Provider"
                                  : "Set as Lead Provider"
                              }
                              onClick={async () => {
                                try {
                                  setActionLoading(provider.user_id);
                                  setActionError(null);

                                  const updated = await setProviderLeader(
                                    provider.user_id,
                                    !provider.is_hospital_leader,
                                  );

                                  setUsers((current) =>
                                    current.map((user) =>
                                      user.user_id === updated.user_id
                                        ? updated
                                        : user,
                                    ),
                                  );
                                } catch (err) {
                                  setActionError(
                                    err instanceof Error
                                      ? err.message
                                      : "Unable to update provider leadership.",
                                  );
                                } finally {
                                  setActionLoading(null);
                                }
                              }}
                              className="rounded-lg border border-[#e0e4e8] p-2 text-[#0054a6] hover:bg-[#f5f7fa] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <UserCheck size={17} />
                            </button>

                            <button
                              type="button"
                              disabled={actionLoading === provider.user_id}
                              title={
                                provider.status.toLowerCase() === "banned" ||
                                provider.status.toLowerCase() === "revoked"
                                  ? "Reinstate Provider"
                                  : "Ban Provider"
                              }
                              onClick={async () => {
                                const isInactive =
                                  provider.status.toLowerCase() === "banned" ||
                                  provider.status.toLowerCase() === "revoked";

                                try {
                                  setActionLoading(provider.user_id);
                                  setActionError(null);

                                  const updated = await toggleProviderStatus(
                                    provider.user_id,
                                    isInactive ? "Active" : "Banned",
                                  );

                                  setUsers((current) =>
                                    current.map((user) =>
                                      user.user_id === updated.user_id
                                        ? updated
                                        : user,
                                    ),
                                  );
                                } catch (err) {
                                  setActionError(
                                    err instanceof Error
                                      ? err.message
                                      : "Unable to update provider status.",
                                  );
                                } finally {
                                  setActionLoading(null);
                                }
                              }}
                              className={`rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                provider.status.toLowerCase() === "banned" ||
                                provider.status.toLowerCase() === "revoked"
                                  ? "border-green-200 text-green-700 hover:bg-green-50"
                                  : "border-red-200 text-red-600 hover:bg-red-50"
                              }`}
                            >
                              {provider.status.toLowerCase() === "banned" ||
                              provider.status.toLowerCase() === "revoked" ? (
                                <UserCheck size={17} />
                              ) : (
                                <Ban size={17} />
                              )}
                            </button>

                            <div className="relative">
                              <button
                                type="button"
                                title="More provider actions"
                                onClick={() =>
                                  setOpenMenuId((current) =>
                                    current === provider.user_id ? null : provider.user_id,
                                  )
                                }
                                className="rounded-lg border border-[#e0e4e8] p-2 text-[#5c6672] transition hover:bg-[#f5f7fa]"
                              >
                                <MoreHorizontal size={17} />
                              </button>

                              {openMenuId === provider.user_id && (
                                <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-[#e0e4e8] bg-white p-1.5 shadow-lg">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedProvider(provider);
                                      setShowProviderDetails(true);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#1a1a1a] hover:bg-[#f5f7fa]"
                                  >
                                    View Provider Details
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingProvider(provider);
                                      setEditForm({
                                        name: provider.name,
                                        email: provider.email,
                                        telephone: provider.telephone ?? "",
                                        designation: provider.designation ?? "",
                                        facility_id: provider.facility_id?.toString() ?? "",
                                      });
                                      setShowEditProvider(true);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#1a1a1a] hover:bg-[#f5f7fa]"
                                  >
                                    Edit Provider
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {showEditProvider && editingProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#e0e4e8] px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#0b1f3f]">
                    Edit Provider
                  </h2>
                  <p className="mt-1 text-sm text-[#5c6672]">
                    Update provider account information.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProvider(false);
                    setEditingProvider(null);
                  }}
                  className="rounded-lg p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!editingProvider) return;

                  setEditing(true);
                  setActionError(null);

                  try {
                    const updated = await updateProvider(editingProvider.user_id, {
                      name: editForm.name,
                      email: editForm.email,
                      telephone: editForm.telephone || null,
                      designation: editForm.designation || null,
                      facility_id: Number(editForm.facility_id),
                    });

                    setUsers((current) =>
                      current.map((provider) =>
                        provider.user_id === updated.user_id ? updated : provider,
                      ),
                    );
                    setShowEditProvider(false);
                    setEditingProvider(null);
                  } catch (error) {
                    setActionError(
                      error instanceof Error
                        ? error.message
                        : "Unable to update provider.",
                    );
                  } finally {
                    setEditing(false);
                  }
                }}
                className="space-y-5 px-6 py-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-[#1a1a1a]">Full Name</span>
                    <input
                      required
                      value={editForm.name}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-[#1a1a1a]">Email</span>
                    <input
                      required
                      type="email"
                      value={editForm.email}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-[#1a1a1a]">Telephone</span>
                    <input
                      value={editForm.telephone}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          telephone: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-sm font-medium text-[#1a1a1a]">Designation</span>
                    <input
                      value={editForm.designation}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          designation: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                    />
                  </label>

                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-sm font-medium text-[#1a1a1a]">Facility</span>
                    <select
                      required
                      value={editForm.facility_id}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          facility_id: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[#e0e4e8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                    >
                      <option value="">Select facility</option>
                      {facilities
                        .filter((facility) => facility.status === "Active")
                        .map((facility) => (
                          <option
                            key={facility.facility_id}
                            value={facility.facility_id}
                          >
                            {facility.name}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#e0e4e8] pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditProvider(false);
                      setEditingProvider(null);
                    }}
                    className="rounded-lg border border-[#e0e4e8] px-4 py-2 text-sm font-medium text-[#5c6672] hover:bg-[#f5f7fa]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editing}
                    className="rounded-lg bg-[#0054a6] px-4 py-2 text-sm font-medium text-white hover:bg-[#00498f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editing ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showProviderDetails && selectedProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#e0e4e8] px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#0b1f3f]">
                    Provider Details
                  </h2>
                  <p className="mt-1 text-sm text-[#5c6672]">
                    Provider account information
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProviderDetails(false);
                    setSelectedProvider(null);
                  }}
                  className="rounded-lg p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 px-6 py-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#5c6672]">Name</p>
                  <p className="mt-1 text-sm font-medium text-[#1a1a1a]">{selectedProvider.name}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#5c6672]">Email</p>
                  <p className="mt-1 break-words text-sm text-[#1a1a1a]">{selectedProvider.email}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#5c6672]">Telephone</p>
                  <p className="mt-1 text-sm text-[#1a1a1a]">{selectedProvider.telephone || "Not provided"}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#5c6672]">Designation</p>
                  <p className="mt-1 text-sm text-[#1a1a1a]">{selectedProvider.designation || "Not provided"}</p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#5c6672]">Facility</p>
                  <p className="mt-1 text-sm text-[#1a1a1a]">
                    {facilityNames.get(selectedProvider.facility_id ?? 0) || "Not assigned"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#5c6672]">Status</p>
                  <p className="mt-1 text-sm font-medium text-[#1a1a1a]">{selectedProvider.status}</p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#5c6672]">Leadership</p>
                  <p className="mt-1 text-sm font-medium text-[#1a1a1a]">
                    {selectedProvider.is_hospital_leader ? "Lead Provider" : "Provider"}
                  </p>
                </div>
              </div>

              <div className="flex justify-end border-t border-[#e0e4e8] px-6 py-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowProviderDetails(false);
                    setSelectedProvider(null);
                  }}
                  className="rounded-lg bg-[#0054a6] px-4 py-2 text-sm font-medium text-white hover:bg-[#00498f]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
      </div>
    </AdminAuthGuard>
  );
}
