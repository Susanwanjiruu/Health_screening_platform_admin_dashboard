"use client";

import {
  Building2,
  ClipboardCheck,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { clearAdminSession } from "@/lib/auth/admin_session";

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Facilities", href: "/facilities", icon: Building2 },
  { label: "Providers", href: "/providers", icon: Stethoscope },
  { label: "Beneficiaries", href: "/beneficiaries", icon: Users },
  { label: "Screenings", href: "/screenings", icon: ClipboardCheck },
  { label: "Referrals", href: "/referrals", icon: ShieldCheck },
  { label: "Reports", href: "/reports", icon: FileBarChart },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    clearAdminSession();
    sessionStorage.removeItem("admin_login_email");

    router.replace("/login");
    router.refresh();
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#0b1f3f] text-white">
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <div>
          <div className="text-xl font-bold tracking-wide">COMPASSION</div>
          <div className="mt-1 text-xs text-white/60">Admin Portal</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => router.push(item.href)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                active
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
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={19} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
