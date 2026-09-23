import {
  getAdminUsers,
  getBeneficiaries,
  getFacilities,
  getFiscalReport,
  type AdminUser,
  type Beneficiary,
  type Facility,
  type FiscalReport,
} from "@/lib/api/admin_api";

export type DashboardData = {
  facilities: Facility[];
  providers: AdminUser[];
  beneficiaries: Beneficiary[];
  fiscalReport: FiscalReport;
};

export async function getDashboardData(
  fiscalYear: string,
): Promise<DashboardData> {
  const [facilities, users, beneficiaries, fiscalReport] =
    await Promise.all([
      getFacilities(),
      getAdminUsers(),
      getBeneficiaries(),
      getFiscalReport(fiscalYear),
    ]);

  return {
    facilities,
    providers: users.filter((user) => user.role === "Provider"),
    beneficiaries,
    fiscalReport,
  };
}

export function getTotalScreenings(report: FiscalReport): number {
  return Object.values(report.report_matrix).reduce(
    (total, cohort) => total + cohort.number_of_participants_screened,
    0,
  );
}
