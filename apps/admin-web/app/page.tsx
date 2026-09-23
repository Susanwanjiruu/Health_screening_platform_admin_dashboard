"use client";

import AdminAuthGuard from "@/components/admin_auth_guard";
import AdminChatbot from "@/components/admin_chatbot";

import {
  Bell,
  Building2,
  ClipboardCheck,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
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

        const data = await getDashboardData("2026");

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

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0b1f3f] text-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div>
            <div className="text-xl font-bold tracking-wide">COMPASSION</div>
            <div className="mt-1 text-xs text-white/60">Admin Portal</div>
          </div>

          <button
            aria-label="Close menu"
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() =>
                  item.label === "Reports"
                    ? router.push("/reports")
                    : item.label === "Settings"
                      ? router.push("/settings")
                      : item.label === "Providers"
                        ? router.push("/providers")
                        : item.label === "Facilities"
                          ? router.push("/facilities")
                        : undefined
                }
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                  item.active
                    ? "bg-[#0054a6] text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white">
            <LogOut size={19} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#e0e4e8] bg-white px-4 shadow-sm sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              className="rounded-lg p-2 text-[#0b1f3f] hover:bg-[#f5f7fa] lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <h1 className="text-lg font-semibold text-[#0b1f3f]">
                Admin Dashboard
              </h1>
              <p className="hidden text-sm text-[#5c6672] sm:block">
                Compassion healthcare administration
              </p>
            </div>
          </div>

          <button
            aria-label="Notifications"
            className="relative rounded-lg p-2.5 text-[#5c6672] hover:bg-[#f5f7fa]"
          >
            <Bell size={21} />
          </button>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-[#0054a6]">
              System Overview
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#0b1f3f] sm:text-3xl">
              Welcome to Compassion
            </h2>
            <p className="mt-2 text-sm text-[#5c6672]">
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
              <p className="mt-2 text-sm text-[#5c6672]">
                Dashboard data is now connected to the Compassion API.
              </p>
            </div>

            <div className="rounded-xl border border-[#e0e4e8] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#0b1f3f]">
                Reporting
              </h3>
              <p className="mt-2 text-sm text-[#5c6672]">
                Fiscal-year reporting is connected to the existing FastAPI
                reporting engine.
              </p>
            </div>
          </section>
        </main>
      </div>
      <AdminChatbot />
    </div>
    </AdminAuthGuard>
  );
}
