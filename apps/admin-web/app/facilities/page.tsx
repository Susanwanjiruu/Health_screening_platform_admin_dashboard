"use client";

import AdminAuthGuard from "@/components/admin_auth_guard";
import {
  Building2,
  CheckCircle2,
  Copy,
  Plus,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  AdminUser,
  Facility,
  createFacility,
  getFacilities,
  getFacilityStaff,
  regenerateFacilityCode,
  updateFacilityStatus,
} from "@/lib/api/admin_api";

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showStaff, setShowStaff] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    contact_info: "",
    cycle_year: new Date().getFullYear().toString(),
  });
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const activeCount = useMemo(
    () => facilities.filter((facility) => facility.status === "Active").length,
    [facilities],
  );

  const inactiveCount = facilities.length - activeCount;

  const loadFacilities = async () => {
    setLoading(true);
    setError(null);

    try {
      setFacilities(await getFacilities());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load facilities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFacilities();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const created = await createFacility({
        name: createForm.name,
        contact_info: createForm.contact_info || null,
        cycle_year: Number(createForm.cycle_year),
      });

      setFacilities((current) => [created, ...current]);
      setCreatedCode(created.unique_code);
      setCreateForm({
        name: "",
        contact_info: "",
        cycle_year: new Date().getFullYear().toString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create facility.");
    }
  };

  const handleStatus = async (facility: Facility) => {
    setActionLoading(facility.facility_id);
    setError(null);

    try {
      const updated = await updateFacilityStatus(
        facility.facility_id,
        facility.status === "Active" ? "Suspended" : "Active",
      );

      setFacilities((current) =>
        current.map((item) =>
          item.facility_id === updated.facility_id ? updated : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update facility status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStaff = async (facility: Facility) => {
    setSelectedFacility(facility);
    setShowStaff(true);
    setStaffLoading(true);
    setError(null);

    try {
      setStaff(await getFacilityStaff(facility.facility_id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load facility staff.");
    } finally {
      setStaffLoading(false);
    }
  };

  const handleRegenerateCode = async (facility: Facility) => {
    setActionLoading(facility.facility_id);
    setError(null);

    try {
      const result = await regenerateFacilityCode(
        facility.facility_id,
        new Date().getFullYear(),
      );
      setCreatedCode(result.unique_code);
      setSelectedFacility({
        ...facility,
        unique_code_cycle_year: result.unique_code_cycle_year,
      });
      setShowCode(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to regenerate facility code.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminAuthGuard>
      <main className="min-h-screen bg-[#f5f7fa]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <button
                type="button"
                onClick={() => window.history.back()}
                className="mb-3 flex items-center gap-2 text-sm text-[#5c6672] hover:text-[#0054a6]"
              >
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-semibold text-[#0b1f3f]">Facilities</h1>
              <p className="mt-1 text-sm text-[#5c6672]">
                Manage healthcare facilities and their provider teams.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreatedCode(null);
                setShowCreate(true);
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#0054a6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#00498f]"
            >
              <Plus size={17} />
              Add Facility
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-[#f0caca] bg-[#fff5f5] px-4 py-3 text-sm text-[#b33a3a]">
              {error}
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#e0e4e8] bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#edf5ff] p-3 text-[#0054a6]">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-sm text-[#5c6672]">Total Facilities</p>
                  <p className="text-2xl font-semibold text-[#0b1f3f]">{facilities.length}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e0e4e8] bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#edf8f1] p-3 text-[#2e8b57]">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-sm text-[#5c6672]">Active</p>
                  <p className="text-2xl font-semibold text-[#0b1f3f]">{activeCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e0e4e8] bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#fff7e6] p-3 text-[#b47700]">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-sm text-[#5c6672]">Inactive</p>
                  <p className="text-2xl font-semibold text-[#0b1f3f]">{inactiveCount}</p>
                </div>
              </div>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#e0e4e8] bg-white">
            <div className="border-b border-[#e0e4e8] px-6 py-5">
              <h2 className="font-semibold text-[#0b1f3f]">All Facilities</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#e0e4e8] bg-[#f8fafc] text-left text-xs uppercase tracking-wide text-[#5c6672]">
                    <th className="px-6 py-3">Facility</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Cycle Year</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#5c6672]">
                        Loading facilities...
                      </td>
                    </tr>
                  ) : facilities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#5c6672]">
                        No facilities found.
                      </td>
                    </tr>
                  ) : (
                    facilities.map((facility) => (
                      <tr key={facility.facility_id} className="border-b border-[#eef0f2] last:border-0">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-[#edf5ff] p-2 text-[#0054a6]">
                              <Building2 size={17} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#1a1a1a]">{facility.name}</p>
                              <p className="text-xs text-[#5c6672]">ID #{facility.facility_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#5c6672]">
                          {facility.contact_info || "Not provided"}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#1a1a1a]">
                          {facility.unique_code_cycle_year || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            facility.status === "Active"
                              ? "bg-[#edf8f1] text-[#2e8b57]"
                              : "bg-[#f5f5f5] text-[#5c6672]"
                          }`}>
                            {facility.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleStaff(facility)}
                              title="View facility staff"
                              className="rounded-lg border border-[#e0e4e8] p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
                            >
                              <Users size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRegenerateCode(facility)}
                              disabled={actionLoading === facility.facility_id}
                              title="Regenerate facility code"
                              className="rounded-lg border border-[#e0e4e8] p-2 text-[#5c6672] hover:bg-[#f5f7fa] disabled:opacity-50"
                            >
                              <RefreshCw size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatus(facility)}
                              disabled={actionLoading === facility.facility_id}
                              className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                                facility.status === "Active"
                                  ? "border-[#f0caca] text-[#b33a3a] hover:bg-[#fff5f5]"
                                  : "border-[#cfe8d9] text-[#2e8b57] hover:bg-[#edf8f1]"
                              }`}
                            >
                              {facility.status === "Active" ? "Deactivate" : "Activate"}
                            </button>
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

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#e0e4e8] px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#0b1f3f]">Add Facility</h2>
                  <p className="mt-1 text-sm text-[#5c6672]">
                    Register a new healthcare facility.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
                >
                  <X size={18} />
                </button>
              </div>

              {createdCode ? (
                <div className="px-6 py-8">
                  <div className="rounded-xl border border-[#cfe8d9] bg-[#edf8f1] p-5">
                    <p className="text-sm font-medium text-[#2e8b57]">Facility created successfully</p>
                    <p className="mt-4 text-xs uppercase tracking-wide text-[#5c6672]">
                      Facility Code
                    </p>
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-4 py-3">
                      <span className="font-mono text-lg font-semibold text-[#0b1f3f]">
                        {createdCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => void navigator.clipboard.writeText(createdCode)}
                        className="rounded-lg p-2 text-[#0054a6] hover:bg-[#edf5ff]"
                        title="Copy facility code"
                      >
                        <Copy size={17} />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="mt-5 w-full rounded-lg bg-[#0054a6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#00498f]"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-5 px-6 py-6">
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-[#1a1a1a]">Facility Name</span>
                    <input
                      required
                      value={createForm.name}
                      onChange={(event) =>
                        setCreateForm((current) => ({ ...current, name: event.target.value }))
                      }
                      className="w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-[#1a1a1a]">Contact Information</span>
                    <input
                      value={createForm.contact_info}
                      onChange={(event) =>
                        setCreateForm((current) => ({
                          ...current,
                          contact_info: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-[#1a1a1a]">Cycle Year</span>
                    <input
                      required
                      type="number"
                      value={createForm.cycle_year}
                      onChange={(event) =>
                        setCreateForm((current) => ({
                          ...current,
                          cycle_year: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                    />
                  </label>

                  <div className="flex justify-end gap-3 border-t border-[#e0e4e8] pt-5">
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="rounded-lg border border-[#e0e4e8] px-4 py-2 text-sm font-medium text-[#5c6672] hover:bg-[#f5f7fa]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#0054a6] px-4 py-2 text-sm font-medium text-white hover:bg-[#00498f]"
                    >
                      Create Facility
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {showStaff && selectedFacility && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#e0e4e8] px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#0b1f3f]">
                    {selectedFacility.name} Staff
                  </h2>
                  <p className="mt-1 text-sm text-[#5c6672]">
                    Providers assigned to this facility.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStaff(false)}
                  className="rounded-lg p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto px-6 py-5">
                {staffLoading ? (
                  <p className="py-8 text-center text-sm text-[#5c6672]">Loading staff...</p>
                ) : staff.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#5c6672]">
                    No providers assigned to this facility.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {staff.map((provider) => (
                      <div
                        key={provider.user_id}
                        className="flex items-center justify-between rounded-xl border border-[#e0e4e8] px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#1a1a1a]">{provider.name}</p>
                          <p className="text-xs text-[#5c6672]">
                            {provider.designation || provider.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {provider.is_hospital_leader && (
                            <span className="rounded-full bg-[#edf5ff] px-2.5 py-1 text-xs font-medium text-[#0054a6]">
                              Lead
                            </span>
                          )}
                          <span className="text-xs text-[#5c6672]">{provider.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showCode && selectedFacility && createdCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#e0e4e8] px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#0b1f3f]">Facility Code</h2>
                  <p className="mt-1 text-sm text-[#5c6672]">{selectedFacility.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCode(false)}
                  className="rounded-lg p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-8">
                <p className="text-xs uppercase tracking-wide text-[#5c6672]">
                  Current Code
                </p>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-[#e0e4e8] bg-[#f8fafc] px-4 py-4">
                  <span className="font-mono text-xl font-semibold text-[#0b1f3f]">
                    {createdCode}
                  </span>
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(createdCode)}
                    className="rounded-lg p-2 text-[#0054a6] hover:bg-[#edf5ff]"
                    title="Copy facility code"
                  >
                    <Copy size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </AdminAuthGuard>
  );
}
