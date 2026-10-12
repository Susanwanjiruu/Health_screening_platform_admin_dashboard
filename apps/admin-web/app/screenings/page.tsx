"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import AdminAuthGuard from "../../components/admin_auth_guard";
import AdminSidebar from "../../components/admin_sidebar";
import { getFacilities, getScreenings, getAdminUsers, type AdminUser, type Facility, type Screening } from "../../lib/api/admin_api";

export default function ScreeningsPage() {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [search, setSearch] = useState("");
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [screeningData, userData, facilityData] = await Promise.all([
          getScreenings(),
          getAdminUsers(),
          getFacilities(),
        ]);
        setScreenings(screeningData);
        setUsers(userData);
        setFacilities(facilityData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load screenings.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const providerNames = useMemo(
    () => new Map(users.map((user) => [user.user_id, user.name])),
    [users],
  );

  const facilityNames = useMemo(
    () => new Map(facilities.map((facility) => [facility.facility_id, facility.name])),
    [facilities],
  );

  const filteredScreenings = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return screenings;
    }

    return screenings.filter((screening) => {
      const providerName = providerNames.get(screening.provider_id) ?? "";
      const facilityName = facilityNames.get(screening.facility_id) ?? "";

      return [
        screening.beneficiary_id,
        screening.fiscal_year,
        screening.malnutrition_status,
        screening.date_of_screening,
        providerName,
        facilityName,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [screenings, search, providerNames, facilityNames]);

  return (
    <AdminAuthGuard>
      <AdminSidebar />
      <div className="min-h-screen bg-[#f5f7fa] lg:pl-64">
        <main className="min-h-screen bg-[#f5f7fa]">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-[#0b1f3f]">Screenings</h1>
              <p className="mt-1 text-sm text-[#5c6672]">
                View submitted beneficiary screening records across the platform.
              </p>
            </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#e0e4e8] bg-white p-5">
              <p className="text-sm text-[#5c6672]">Total Screenings</p>
              <p className="mt-2 text-2xl font-bold text-[#0b1f3f]">{screenings.length}</p>
            </div>
            <div className="rounded-xl border border-[#e0e4e8] bg-white p-5">
              <p className="text-sm text-[#5c6672]">With Referral Follow-up</p>
              <p className="mt-2 text-2xl font-bold text-[#0b1f3f]">
                {screenings.filter((screening) => screening.requires_referral_followup).length}
              </p>
            </div>
            <div className="rounded-xl border border-[#e0e4e8] bg-white p-5">
              <p className="text-sm text-[#5c6672]">Current Results</p>
              <p className="mt-2 text-2xl font-bold text-[#0b1f3f]">{filteredScreenings.length}</p>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-[#e0e4e8] bg-white p-4">
            <div className="relative max-w-xl">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6672]"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search beneficiary ID, provider, facility, fiscal year..."
                className="w-full rounded-lg border border-[#e0e4e8] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#0054a6]"
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-[#e0e4e8] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-[#e0e4e8] bg-[#f8fafc]">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">Beneficiary</th>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">Provider</th>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">Facility</th>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">Screened</th>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">Fiscal Year</th>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">Malnutrition</th>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr key="loading">
                      <td colSpan={7} className="px-5 py-10 text-center text-[#5c6672]">
                        Loading screenings...
                      </td>
                    </tr>
                  ) : filteredScreenings.length === 0 ? (
                    <tr key="empty">
                      <td colSpan={7} className="px-5 py-10 text-center text-[#5c6672]">
                        No screening records found.
                      </td>
                    </tr>
                  ) : (
                    filteredScreenings.map((screening, index) => (
                      <tr
                        key={screening.record_id ?? screening.beneficiary_id ?? `screening-${index}`}
                        className="border-b border-[#e0e4e8] last:border-b-0"
                      >
                        <td className="px-5 py-4 font-medium text-[#1a1a1a]">
                          {screening.beneficiary_id}
                        </td>
                        <td className="px-5 py-4 text-[#5c6672]">
                          {providerNames.get(screening.provider_id) ?? `Provider #${screening.provider_id}`}
                        </td>
                        <td className="px-5 py-4 text-[#5c6672]">
                          {facilityNames.get(screening.facility_id) ?? `Facility #${screening.facility_id}`}
                        </td>
                        <td className="px-5 py-4 text-[#5c6672]">
                          {new Date(screening.date_of_screening).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-[#5c6672]">{screening.fiscal_year}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-medium text-[#334155]">
                            {screening.malnutrition_status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedScreening(screening)}
                            className="font-medium text-[#0054a6] hover:underline"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        </main>
      </div>

      {selectedScreening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e0e4e8] px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#0b1f3f]">Screening Details</h2>
                <p className="mt-1 text-sm text-[#5c6672]">
                  Record #{selectedScreening.record_id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScreening(null)}
                className="rounded-lg p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
              <Detail label="Beneficiary ID" value={selectedScreening.beneficiary_id} />
              <Detail
                label="Provider"
                value={providerNames.get(selectedScreening.provider_id) ?? `Provider #${selectedScreening.provider_id}`}
              />
              <Detail
                label="Facility"
                value={facilityNames.get(selectedScreening.facility_id) ?? `Facility #${selectedScreening.facility_id}`}
              />
              <Detail
                label="Date of Screening"
                value={new Date(selectedScreening.date_of_screening).toLocaleDateString()}
              />
              <Detail label="Fiscal Year" value={selectedScreening.fiscal_year} />
              <Detail label="BMI" value={selectedScreening.bmi?.toString() ?? "Not recorded"} />
              <Detail label="Malnutrition Status" value={selectedScreening.malnutrition_status} />
              <Detail
                label="BMI Cross-check"
                value={selectedScreening.bmi_computed_malnutrition_status ?? "Not available"}
              />
              <Detail
                label="Referral Follow-up"
                value={selectedScreening.requires_referral_followup ? "Yes" : "No"}
              />
              <Detail
                label="Examiner"
                value={selectedScreening.examiner_name ?? "Not recorded"}
              />
              <Detail
                label="Qualification"
                value={selectedScreening.examiner_qualification ?? "Not recorded"}
              />
              <Detail
                label="Telephone"
                value={selectedScreening.examiner_telephone ?? "Not recorded"}
              />
              <Detail label="Submitted At" value={new Date(selectedScreening.submitted_at).toLocaleString()} />
            </div>
          </div>
        </div>
      )}
    </AdminAuthGuard>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[#5c6672]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#1a1a1a]">{value}</p>
    </div>
  );
}
