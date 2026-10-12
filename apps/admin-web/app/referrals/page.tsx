"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import AdminAuthGuard from "../../components/admin_auth_guard";
import AdminSidebar from "../../components/admin_sidebar";
import {
  getFacilities,
  getReferrals,
  type Facility,
  type Referral,
} from "../../lib/api/admin_api";

function formatReferralStatus(status: string) {
  if (status === "LostToFollowUp") return "Lost to Follow-up";
  return status;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [referralData, facilityData] = await Promise.all([
          getReferrals(),
          getFacilities(),
        ]);
        setReferrals(referralData);
        setFacilities(facilityData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load referrals.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const facilityNames = useMemo(
    () => new Map(facilities.map((facility) => [facility.facility_id, facility.name])),
    [facilities],
  );

  const statuses = [
    "Identified",
    "Referred",
    "Scheduled",
    "Completed",
    "LostToFollowUp",
  ];

  const filteredReferrals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return referrals.filter((referral) => {
      const matchesStatus =
        statusFilter === "All" || referral.status === statusFilter;

      const facilityName = facilityNames.get(referral.facility_id) ?? "";

      const matchesSearch =
        !query ||
        [
          referral.beneficiary_id,
          referral.reason,
          referral.urgency,
          referral.status,
          referral.is_safeguarding_case,
          referral.referred_to ?? "",
          facilityName,
          String(referral.record_id),
        ].some((value) => value.toLowerCase().includes(query));

      return matchesStatus && matchesSearch;
    });
  }, [referrals, search, statusFilter, facilityNames]);

  const safeguardingCount = referrals.filter(
    (referral) => referral.is_safeguarding_case === "Yes",
  ).length;

  const openCount = referrals.filter(
    (referral) =>
      referral.status !== "Completed" &&
      referral.status !== "LostToFollowUp",
  ).length;

  return (
    <AdminAuthGuard>
      <AdminSidebar />

      <div className="min-h-screen bg-[#f5f7fa] lg:pl-64">
        <main className="min-h-screen bg-[#f5f7fa]">
          <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0b1f3f]">Referrals</h1>
            <p className="mt-1 text-sm text-[#5c6672]">
              Review referral records generated from beneficiary screenings.
            </p>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#e0e4e8] bg-white p-5">
              <p className="text-sm text-[#5c6672]">Total Referrals</p>
              <p className="mt-2 text-2xl font-bold text-[#0b1f3f]">
                {referrals.length}
              </p>
            </div>

            <div className="rounded-xl border border-[#e0e4e8] bg-white p-5">
              <p className="text-sm text-[#5c6672]">Open Referrals</p>
              <p className="mt-2 text-2xl font-bold text-[#0b1f3f]">
                {openCount}
              </p>
            </div>

            <div className="rounded-xl border border-[#e0e4e8] bg-white p-5">
              <p className="text-sm text-[#5c6672]">Safeguarding Cases</p>
              <p className="mt-2 text-2xl font-bold text-[#0b1f3f]">
                {safeguardingCount}
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-[#e0e4e8] bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6672]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search beneficiary, facility, reason, urgency..."
                  className="w-full rounded-lg border border-[#e0e4e8] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#0054a6]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-[#e0e4e8] bg-white px-4 py-3 text-sm outline-none focus:border-[#0054a6]"
              >
                <option value="All">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {formatReferralStatus(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-[#e0e4e8] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b border-[#e0e4e8] bg-[#f8fafc]">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">
                      Beneficiary
                    </th>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">
                      Facility
                    </th>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">
                      Reason
                    </th>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">
                      Urgency
                    </th>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">
                      Safeguarding
                    </th>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">
                      Status
                    </th>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">
                      Created
                    </th>
                    <th className="px-5 py-4 font-semibold text-[#1a1a1a]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-center text-[#5c6672]"
                      >
                        Loading referrals...
                      </td>
                    </tr>
                  ) : filteredReferrals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-5 py-10 text-center text-[#5c6672]"
                      >
                        No referrals found.
                      </td>
                    </tr>
                  ) : (
                    filteredReferrals.map((referral) => (
                      <tr
                        key={referral.referral_id}
                        className="border-b border-[#e0e4e8] last:border-b-0"
                      >
                        <td className="px-5 py-4 font-medium text-[#1a1a1a]">
                          {referral.beneficiary_id}
                        </td>

                        <td className="px-5 py-4 text-[#5c6672]">
                          {facilityNames.get(referral.facility_id) ??
                            `Facility #${referral.facility_id}`}
                        </td>

                        <td className="max-w-xs px-5 py-4 text-[#5c6672]">
                          <span className="line-clamp-2">{referral.reason}</span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-medium text-[#334155]">
                            {referral.urgency}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {referral.is_safeguarding_case}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-xs font-medium text-[#334155]">
                            {formatReferralStatus(referral.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-[#5c6672]">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedReferral(referral)}
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

      {selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e0e4e8] px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#0b1f3f]">
                  Referral Details
                </h2>
                <p className="mt-1 text-sm text-[#5c6672]">
                  Referral #{selectedReferral.referral_id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReferral(null)}
                className="rounded-lg p-2 text-[#5c6672] hover:bg-[#f5f7fa]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 px-6 py-6 sm:grid-cols-2">
              <Detail
                label="Beneficiary ID"
                value={selectedReferral.beneficiary_id}
              />

              <Detail
                label="Screening Record"
                value={`#${selectedReferral.record_id}`}
              />

              <Detail
                label="Facility"
                value={
                  facilityNames.get(selectedReferral.facility_id) ??
                  `Facility #${selectedReferral.facility_id}`
                }
              />

              <Detail label="Urgency" value={selectedReferral.urgency} />

              <Detail
                label="Safeguarding Case"
                value={selectedReferral.is_safeguarding_case}
              />

              <Detail label="Status" value={formatReferralStatus(selectedReferral.status)} />

              <Detail
                label="Referred To"
                value={selectedReferral.referred_to ?? "Not specified"}
              />

              <Detail
                label="Created"
                value={new Date(selectedReferral.created_at).toLocaleString()}
              />

              <Detail
                label="Last Updated"
                value={new Date(selectedReferral.updated_at).toLocaleString()}
              />

              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-[#5c6672]">
                  Reason
                </p>
                <p className="mt-1 text-sm font-medium text-[#1a1a1a]">
                  {selectedReferral.reason}
                </p>
              </div>
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
      <p className="text-xs font-medium uppercase tracking-wide text-[#5c6672]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[#1a1a1a]">{value}</p>
    </div>
  );
}
