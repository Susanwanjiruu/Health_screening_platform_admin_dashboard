"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminSessionToken } from "@/lib/auth/admin_session";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getAdminSessionToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <div className="text-sm text-[#5c6672]">Checking your session...</div>
      </div>
    );
  }

  return <>{children}</>;
}
