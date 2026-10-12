"use client";

import { getFiscalYear } from "@/lib/utils/fiscal_year";

import AdminAuthGuard from "@/components/admin_auth_guard";
import AdminChatbot from "@/components/admin_chatbot";
import AdminSidebar from "@/components/admin_sidebar";

import { Bell, Building2, ClipboardCheck, FileBarChart, LayoutDashboard, Menu, Settings, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDashboardData,
  getTotalScreenings,
} from "@/lib/api/admin_dashboard";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Facilities", icon: Building2 },
  { label: "Providers", icon: Stethoscope },
  { label: "Beneficiaries", icon: Users },
  { label: "Screenings", icon: ClipboardCheck },
  { label: "Referrals", icon: ShieldCheck },
  { label: "Reports", icon: FileBarChart },
  { label: "Settings", icon: Settings },
];

const overviewCards = [
  {
    label: "Total Facilities",
    icon: Building2,
    description: "Registered healthcare facilities",
  },
  {
    label: "Providers",
    icon: Stethoscope,
    description: "Active provider accounts",
  },
  {
    label: "Beneficiaries",
    icon: Users,
    description: "Registered beneficiaries",
  },
  {
    label: "Screenings",
    icon: ClipboardCheck,
    description: "Screenings this fiscal year",
  },
];

export default function Home() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<Awaited<
    ReturnType<typeof getDashboardData>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboardData(getFiscalYear());

        if (active) {
          setDashboardData(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard data.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const cardValues = {
    "Total Facilities": dashboardData?.facilities.length ?? 0,
    Providers: dashboardData?.providers.length ?? 0,
    Beneficiaries: dashboardData?.beneficiaries.length ?? 0,
    Screenings: dashboardData ? getTotalScreenings(dashboardData.fiscalReport) : 0,
  };

  return (
    <AdminAuthGuard>
    <div className="min-h-screen bg-[#f5f7fa]">
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar />

      <div className="lg:pl-64">
        <main className="relative mx-auto max-w-7xl px-6 py-8">
          <button
            aria-label="Notifications"
            className="absolute right-6 top-6 rounded-lg p-2.5 text-[#5c6672] hover:bg-white"
          >
            <Bell size={21} />
          </button>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-[#0b1f3f]">
              Welcome to the Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-[#5c6672]">
              Monitor facilities, providers, beneficiaries, screenings and
              reporting from one place.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-[#d64545]/20 bg-[#d64545]/5 px-4 py-3 text-sm text-[#d64545]">
              {error}
            </div>
          )}

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-xl border border-[#e0e4e8] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#5c6672]">
                        {card.label}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-[#0b1f3f]">
                        {loading ? "…" : cardValues[card.label as keyof typeof cardValues]}
                      </p>
                    </div>

                    <div className="rounded-lg bg-[#0054a6]/10 p-3 text-[#0054a6]">
                      <Icon size={21} />
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-[#5c6672]">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-[#e0e4e8] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#0b1f3f]">
                Recent Activity
              </h3>
              <p className="mt-1 text-sm text-[#5c6672]">
                Latest activity across the platform.
              </p>

              <div className="mt-5 space-y-4">
                {dashboardData
                  ? [
                  ...dashboardData.screenings.map((screening) => ({
                    type: "Screening submitted",
                    detail: screening.beneficiary_id,
                    date: screening.submitted_at,
                  })),
                  ...dashboardData!.providers.map((provider) => ({
                    type: "Provider registered",
                    detail: provider.name,
                    date: provider.created_at,
                  })),
                  ...dashboardData!.beneficiaries.map((beneficiary) => ({
                    type: "Beneficiary registered",
                    detail: beneficiary.beneficiary_id,
                    date: beneficiary.created_at ?? beneficiary.last_updated_at ?? "",
                  })),
                  ...dashboardData!.facilities.map((facility) => ({
                    type: "Facility registered",
                    detail: facility.name,
                    date: facility.created_at,
                  })),
                ]
                  .filter((activity) => activity.date)
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime(),
                  )
                  .slice(0, 4)
                  .map((activity, index) => (
                    <div
                      key={`${activity.type}-${activity.detail}-${index}`}
                      className="flex items-start justify-between gap-4 border-b border-[#eef1f4] pb-3 last:border-b-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#0b1f3f]">
                          {activity.type}
                        </p>
                        <p className="mt-1 text-xs text-[#5c6672]">
                          {activity.detail}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-[#7a8490]">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                  : loading
                    ? <p className="text-sm text-[#5c6672]">Loading recent activity...</p>
                    : <p className="text-sm text-[#5c6672]">No recent activity.</p>}
              </div>
            </div>

            <div className="rounded-xl border border-[#e0e4e8] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#0b1f3f]">
                    Reporting
                  </h3>
                  <p className="mt-1 text-sm text-[#5c6672]">
                    Current fiscal-year reporting summary.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/reports")}
                  className="text-sm font-medium text-[#0054a6] hover:underline"
                >
                  View report
                </button>
              </div>

              {dashboardData && (
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#7a8490]">
                      Fiscal Year
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#0b1f3f]">
                      {dashboardData.fiscalReport.fiscal_year}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#7a8490]">
                      Registered
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#0b1f3f]">
                      {Object.values(dashboardData.fiscalReport.report_matrix).reduce(
                        (total, cohort) =>
                          total + cohort.number_of_registered_participants,
                        0,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#7a8490]">
                      Screened
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#0b1f3f]">
                      {getTotalScreenings(dashboardData.fiscalReport)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#7a8490]">
                      Referred
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#0b1f3f]">
                      {Object.values(dashboardData.fiscalReport.report_matrix).reduce(
                        (total, cohort) =>
                          total + cohort.referred_for_further_treatment,
                        0,
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
      <AdminChatbot />
    </div>
    </AdminAuthGuard>
  );
}
