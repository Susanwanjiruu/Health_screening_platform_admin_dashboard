"use client";

import AdminAuthGuard from "@/components/admin_auth_guard";
import AdminSidebar from "@/components/admin_sidebar";
import {
  Beneficiary,
  createBeneficiary,
  getBeneficiaries,
  updateBeneficiary,
} from "@/lib/api/admin_api";
import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, X } from "lucide-react";

const cohorts = [
  "All Cohorts",
  "Survival Mother",
  "Survival Baby",
  "Sponsorship Participant",
];

type FormState = {
  beneficiary_id: string;
  first_name: string;
  last_name: string;
  birthdate: string;
  gender: string;
  cohort_type: string;
  consent_on_file: boolean;
};

const emptyForm: FormState = {
  beneficiary_id: "",
  first_name: "",
  last_name: "",
  birthdate: "",
  gender: "",
  cohort_type: "Survival Mother",
  consent_on_file: false,
};

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cohortFilter, setCohortFilter] = useState("All Cohorts");
  const [selected, setSelected] = useState<Beneficiary | null>(null);
  const [editing, setEditing] = useState<Beneficiary | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function loadBeneficiaries() {
    try {
      setLoading(true);
      setError(null);
      const data = await getBeneficiaries();
      setBeneficiaries(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load beneficiaries.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const filteredBeneficiaries = useMemo(() => {
    const query = search.trim().toLowerCase();

    return beneficiaries.filter((beneficiary) => {
      const matchesCohort =
        cohortFilter === "All Cohorts" ||
        beneficiary.cohort_type === cohortFilter;

      const matchesSearch =
        !query ||
        beneficiary.beneficiary_id.toLowerCase().includes(query) ||
        beneficiary.first_name.toLowerCase().includes(query) ||
        beneficiary.last_name.toLowerCase().includes(query);

      return matchesCohort && matchesSearch;
    });
  }, [beneficiaries, search, cohortFilter]);

  function openCreate() {
    setError(null);
    setForm(emptyForm);
    setShowCreate(true);
  }

  function openEdit(beneficiary: Beneficiary) {
    setError(null);
    setEditing(beneficiary);
    setForm({
      beneficiary_id: beneficiary.beneficiary_id,
      first_name: beneficiary.first_name,
      last_name: beneficiary.last_name,
      birthdate: beneficiary.birthdate ?? "",
      gender: beneficiary.gender ?? "",
      cohort_type: beneficiary.cohort_type,
      consent_on_file: beneficiary.consent_on_file,
    });
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    if (
      form.cohort_type !== "Survival Mother" &&
      !form.birthdate
    ) {
      setError("Birthdate is required for this cohort.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const created = await createBeneficiary({
        beneficiary_id: form.beneficiary_id.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        birthdate: form.birthdate || null,
        gender: form.gender || null,
        cohort_type: form.cohort_type,
        consent_on_file: form.consent_on_file,
      });

      setBeneficiaries((current) => [...current, created]);
      setShowCreate(false);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create beneficiary.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(event: React.FormEvent) {
    event.preventDefault();

    if (!editing) return;

    try {
      setSaving(true);
      setError(null);

      const updated = await updateBeneficiary(editing.beneficiary_id, {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        birthdate: form.birthdate || null,
        gender: form.gender || null,
        consent_on_file: form.consent_on_file,
      });

      setBeneficiaries((current) =>
        current.map((item) =>
          item.beneficiary_id === updated.beneficiary_id ? updated : item,
        ),
      );
      setEditing(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update beneficiary.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminAuthGuard>
      <AdminSidebar />
      <div className="lg:pl-64">
      <div className="min-h-screen bg-[#f5f7fa]">
        <main className="min-h-screen bg-[#f5f7fa]">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-semibold text-[#0b1f3f]">
                  Beneficiaries
                </h1>
                <p className="mt-1 text-sm text-[#5c6672]">
                  Manage registered beneficiaries and their basic records.
                </p>
              </div>

              <button
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0054a6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#004789]"
              >
                <Plus size={18} />
                Add Beneficiary
              </button>
            </div>
          {error && (
            <div className="mb-6 rounded-xl border border-[#d64545]/20 bg-[#d64545]/5 px-4 py-3 text-sm text-[#d64545]">
              {error}
            </div>
          )}

          <section className="mb-6 grid gap-5 sm:grid-cols-3">
            <div className="rounded-xl border border-[#e0e4e8] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#5c6672]">Total Beneficiaries</p>
              <p className="mt-2 text-3xl font-bold text-[#0b1f3f]">
                {beneficiaries.length}
              </p>
            </div>
            <div className="rounded-xl border border-[#e0e4e8] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#5c6672]">Survival Mothers</p>
              <p className="mt-2 text-3xl font-bold text-[#0b1f3f]">
                {
                  beneficiaries.filter(
                    (item) => item.cohort_type === "Survival Mother",
                  ).length
                }
              </p>
            </div>
            <div className="rounded-xl border border-[#e0e4e8] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#5c6672]">Sponsorship Participants</p>
              <p className="mt-2 text-3xl font-bold text-[#0b1f3f]">
                {
                  beneficiaries.filter(
                    (item) =>
                      item.cohort_type === "Sponsorship Participant",
                  ).length
                }
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-[#e0e4e8] bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-[#e0e4e8] p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6672]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search ID or beneficiary name"
                  className="w-full rounded-lg border border-[#e0e4e8] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#0054a6]"
                />
              </div>

              <select
                value={cohortFilter}
                onChange={(event) => setCohortFilter(event.target.value)}
                className="rounded-lg border border-[#e0e4e8] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#0054a6]"
              >
                {cohorts.map((cohort) => (
                  <option key={cohort}>{cohort}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-[#5c6672]">
                Loading beneficiaries...
              </div>
            ) : filteredBeneficiaries.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#5c6672]">
                No beneficiaries found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-[#f5f7fa] text-xs uppercase text-[#5c6672]">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Beneficiary</th>
                      <th className="px-5 py-3 font-semibold">Cohort</th>
                      <th className="px-5 py-3 font-semibold">Gender</th>
                      <th className="px-5 py-3 font-semibold">Birthdate</th>
                      <th className="px-5 py-3 font-semibold">Consent</th>
                      <th className="px-5 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e4e8]">
                    {filteredBeneficiaries.map((beneficiary) => (
                      <tr key={beneficiary.beneficiary_id}>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#0b1f3f]">
                            {beneficiary.first_name} {beneficiary.last_name}
                          </p>
                          <p className="mt-1 text-xs text-[#5c6672]">
                            {beneficiary.beneficiary_id}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#1a1a1a]">
                          {beneficiary.cohort_type}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#1a1a1a]">
                          {beneficiary.gender || "—"}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#1a1a1a]">
                          {beneficiary.birthdate || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              beneficiary.consent_on_file
                                ? "bg-[#2e8b57]/10 text-[#2e8b57]"
                                : "bg-[#e0a72e]/10 text-[#a06f00]"
                            }`}
                          >
                            {beneficiary.consent_on_file
                              ? "On file"
                              : "Not on file"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelected(beneficiary)}
                              className="rounded-lg border border-[#e0e4e8] p-2 text-[#0054a6] hover:bg-[#f5f7fa]"
                              aria-label="View beneficiary"
                            >
                              <Eye size={17} />
                            </button>
                            <button
                              onClick={() => openEdit(beneficiary)}
                              className="rounded-lg border border-[#e0e4e8] p-2 text-[#0054a6] hover:bg-[#f5f7fa]"
                              aria-label="Edit beneficiary"
                            >
                              <Pencil size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          </div>
        </main>

        {(showCreate || editing) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#e0e4e8] px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-[#0b1f3f]">
                    {editing ? "Edit Beneficiary" : "Add Beneficiary"}
                  </h2>
                  <p className="mt-1 text-sm text-[#5c6672]">
                    {editing
                      ? "Update the beneficiary record."
                      : "Register a new beneficiary."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setEditing(null);
                  }}
                  className="rounded-lg p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={editing ? handleUpdate : handleCreate}
                className="grid gap-5 p-6 sm:grid-cols-2"
              >
                {!editing && (
                  <label className="sm:col-span-2">
                    <span className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">
                      Beneficiary ID
                    </span>
                    <input
                      required
                      value={form.beneficiary_id}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          beneficiary_id: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                    />
                  </label>
                )}

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">
                    First Name
                  </span>
                  <input
                    required
                    value={form.first_name}
                    onChange={(event) =>
                      setForm({ ...form, first_name: event.target.value })
                    }
                    className="w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">
                    Last Name
                  </span>
                  <input
                    required
                    value={form.last_name}
                    onChange={(event) =>
                      setForm({ ...form, last_name: event.target.value })
                    }
                    className="w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                  />
                </label>

                {!editing && (
                  <label>
                    <span className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">
                      Cohort
                    </span>
                    <select
                      value={form.cohort_type}
                      onChange={(event) =>
                        setForm({ ...form, cohort_type: event.target.value })
                      }
                      className="w-full rounded-lg border border-[#e0e4e8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                    >
                      {cohorts.slice(1).map((cohort) => (
                        <option key={cohort}>{cohort}</option>
                      ))}
                    </select>
                  </label>
                )}

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">
                    Birthdate
                  </span>
                  <input
                    type="date"
                    value={form.birthdate}
                    onChange={(event) =>
                      setForm({ ...form, birthdate: event.target.value })
                    }
                    className="w-full rounded-lg border border-[#e0e4e8] px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-[#1a1a1a]">
                    Gender
                  </span>
                  <select
                    value={form.gender}
                    onChange={(event) =>
                      setForm({ ...form, gender: event.target.value })
                    }
                    className="w-full rounded-lg border border-[#e0e4e8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0054a6]"
                  >
                    <option value="">Not specified</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </label>

                <label className="flex items-center gap-3 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.consent_on_file}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        consent_on_file: event.target.checked,
                      })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-[#1a1a1a]">
                    Consent is on file
                  </span>
                </label>

                <div className="flex justify-end gap-3 border-t border-[#e0e4e8] pt-5 sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreate(false);
                      setEditing(null);
                    }}
                    className="rounded-lg border border-[#e0e4e8] px-4 py-2.5 text-sm font-semibold text-[#1a1a1a]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#0054a6] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editing
                        ? "Save Changes"
                        : "Create Beneficiary"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#e0e4e8] px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-[#0b1f3f]">
                    Beneficiary Details
                  </h2>
                  <p className="mt-1 text-sm text-[#5c6672]">
                    {selected.beneficiary_id}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#5c6672]">Name</p>
                  <p className="mt-1 font-semibold text-[#0b1f3f]">
                    {selected.first_name} {selected.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#5c6672]">Cohort</p>
                  <p className="mt-1 font-semibold text-[#0b1f3f]">
                    {selected.cohort_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#5c6672]">Birthdate</p>
                  <p className="mt-1 text-sm text-[#1a1a1a]">
                    {selected.birthdate || "Not recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#5c6672]">Gender</p>
                  <p className="mt-1 text-sm text-[#1a1a1a]">
                    {selected.gender || "Not recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#5c6672]">Consent</p>
                  <p className="mt-1 text-sm text-[#1a1a1a]">
                    {selected.consent_on_file ? "On file" : "Not on file"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#5c6672]">Created</p>
                  <p className="mt-1 text-sm text-[#1a1a1a]">
                    {selected.created_at
                      ? new Date(selected.created_at).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </AdminAuthGuard>
  );
}
