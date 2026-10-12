import {
  getAdminUsers,
  getBeneficiaries,
  getFacilities,
  getFiscalReport,
  getScreenings,
  type AdminUser,
  type Beneficiary,
  type Facility,
  type FiscalReport,
  type Screening,
} from "@/lib/api/admin_api";

export type DashboardData = {
  facilities: Facility[];
  providers: AdminUser[];
  beneficiaries: Beneficiary[];
  screenings: Screening[];
  fiscalReport: FiscalReport;
};

export async function getDashboardData(
  fiscalYear: string,
): Promise<DashboardData> {
  const [facilities, users, beneficiaries, screenings, fiscalReport] =
    await Promise.all([
      getFacilities(),
      getAdminUsers(),
      getBeneficiaries(),
      getScreenings(),
      getFiscalReport(fiscalYear),
    ]);

  return {
    facilities,
    providers: users.filter((user) => user.role === "Provider"),
    beneficiaries,
    screenings,
    fiscalReport,
  };
}

export function getTotalScreenings(report: FiscalReport): number {
  return Object.values(report.report_matrix).reduce(
    (total, cohort) => total + cohort.number_of_participants_screened,
    0,
  );
}
