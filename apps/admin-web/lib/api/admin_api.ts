import { apiRequest } from "@/lib/api/client";
import { getAdminSessionToken } from "@/lib/auth/admin_session";

export type AdminUser = {
  user_id: number;
  name: string;
  email: string;
  telephone?: string | null;
  role: string;
  status: string;
  designation?: string | null;
  facility_id?: number | null;
  is_hospital_leader: boolean;
  must_change_password: boolean;
  profile_image_path?: string | null;
  created_at: string;
};

export type Facility = {
  facility_id: number;
  name: string;
  contact_info?: string | null;
  status: string;
  unique_code_cycle_year?: number | null;
  created_at: string;
};

export type Beneficiary = {
  beneficiary_id: string;
  first_name: string;
  last_name: string;
  birthdate?: string | null;
  gender?: string | null;
  cohort_type: string;
  consent_on_file: boolean;
  last_updated_at?: string | null;
  created_at?: string | null;
};

export type Screening = {
  record_id: number;
  beneficiary_id: string;
  provider_id: number;
  facility_id: number;
  date_of_screening: string;
  fiscal_year: string;
  bmi?: number | null;
  malnutrition_status: string;
  bmi_computed_malnutrition_status?: string | null;
  requires_referral_followup: boolean;
  examiner_name?: string | null;
  examiner_qualification?: string | null;
  examiner_telephone?: string | null;
  submitted_at: string;
};

export type Referral = {
  referral_id: number;
  record_id: number;
  beneficiary_id: string;
  facility_id: number;
  reason: string;
  referred_to?: string | null;
  urgency: string;
  is_safeguarding_case: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function requireAdminToken(): string {
  const token = getAdminSessionToken();

  if (!token) {
    throw new Error("Your admin session has expired. Please log in again.");
  }

  return token;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>("/user", {
    method: "GET",
    token: requireAdminToken(),
  });
}

export async function createFacility(payload: {
  name: string;
  contact_info?: string | null;
  cycle_year: number;
}): Promise<Facility & { unique_code: string }> {
  return apiRequest<Facility & { unique_code: string }>("/facility", {
    method: "POST",
    token: requireAdminToken(),
    body: JSON.stringify(payload),
  });
}

export async function getFacilityStaff(
  facilityId: number,
): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>(`/facility/${facilityId}/staff`, {
    method: "GET",
    token: requireAdminToken(),
  });
}

export async function updateFacilityStatus(
  facilityId: number,
  status: string,
): Promise<Facility> {
  return apiRequest<Facility>(`/facility/${facilityId}/status`, {
    method: "PUT",
    token: requireAdminToken(),
    body: JSON.stringify({ status }),
  });
}

export async function regenerateFacilityCode(
  facilityId: number,
  cycleYear: number,
): Promise<{
  facility_id: number;
  unique_code: string;
  unique_code_cycle_year: number;
}> {
  return apiRequest(
    `/facility/${facilityId}/regenerate-code?cycle_year=${cycleYear}`,
    {
      method: "POST",
      token: requireAdminToken(),
    },
  );
}

export async function createProvider(payload: {
  name: string;
  email: string;
  telephone?: string | null;
  designation?: string | null;
  facility_id: number;
  is_hospital_leader: boolean;
}): Promise<AdminUser> {
  return apiRequest<AdminUser>("/user", {
    method: "POST",
    token: requireAdminToken(),
    body: JSON.stringify(payload),
  });
}

export async function updateProvider(
  userId: number,
  payload: {
    name: string;
    email: string;
    telephone?: string | null;
    designation?: string | null;
    facility_id: number;
  },
): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/user/${userId}`, {
    method: "PUT",
    token: requireAdminToken(),
    body: JSON.stringify(payload),
  });
}

export async function setProviderLeader(
  userId: number,
  isHospitalLeader: boolean,
): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/user/${userId}/set-leader`, {
    method: "PUT",
    token: requireAdminToken(),
    body: JSON.stringify({
      is_hospital_leader: isHospitalLeader,
    }),
  });
}

export async function toggleProviderStatus(
  userId: number,
  targetStatus: "Active" | "Revoked" | "Banned",
): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/user/${userId}/toggle-status`, {
    method: "PUT",
    token: requireAdminToken(),
    body: JSON.stringify({
      target_status: targetStatus,
    }),
  });
}

export async function getFacilities(): Promise<Facility[]> {
  return apiRequest<Facility[]>("/facility", {
    method: "GET",
    token: requireAdminToken(),
  });
}

export async function createBeneficiary(payload: {
  beneficiary_id: string;
  first_name: string;
  last_name: string;
  birthdate?: string | null;
  gender?: string | null;
  cohort_type: string;
  consent_on_file: boolean;
}): Promise<Beneficiary> {
  return apiRequest<Beneficiary>("/beneficiary", {
    method: "POST",
    token: requireAdminToken(),
    body: JSON.stringify(payload),
  });
}

export async function updateBeneficiary(
  beneficiaryId: string,
  payload: {
    first_name?: string;
    last_name?: string;
    birthdate?: string | null;
    gender?: string | null;
    consent_on_file?: boolean;
  },
): Promise<Beneficiary> {
  return apiRequest<Beneficiary>(`/beneficiary/${beneficiaryId}`, {
    method: "PUT",
    token: requireAdminToken(),
    body: JSON.stringify(payload),
  });
}

export async function getBeneficiaries(): Promise<Beneficiary[]> {
  return apiRequest<Beneficiary[]>("/beneficiary", {
    method: "GET",
    token: requireAdminToken(),
  });
}

export async function getScreenings(): Promise<Screening[]> {
  return apiRequest<Screening[]>("/screening", {
    method: "GET",
    token: requireAdminToken(),
  });
}

export async function getScreeningStatus(): Promise<unknown> {
  return apiRequest<unknown>("/screening/status", {
    method: "GET",
    token: requireAdminToken(),
  });
}

export async function getReferrals(): Promise<Referral[]> {
  return apiRequest<Referral[]>("/referrals", {
    method: "GET",
    token: requireAdminToken(),
  });
}

export type FiscalReport = {
  center_name: string | null;
  region: string | null;
  fiscal_year: string;
  submission_metadata: {
    compiled_by: string | null;
    telephone: string | null;
    designation: string | null;
    screening_completion_date: string | null;
  };
  report_matrix: Record<
    string,
    {
      number_of_registered_participants: number;
      number_of_participants_screened: number;
      number_not_yet_screened: number;
      mild_malnutrition: number;
      moderate_malnutrition: number;
      severe_malnutrition: number;
      immunization_cards: number;
      vitamin_a_supplemented: number;
      dewormed: number;
      hiv_tested: number;
      disease_prevalence: Record<string, number>;
      received_treatment_at_site: number;
      prescriptions_given: number;
      referred_for_further_treatment: number;
    }
  >;
};

export async function getFiscalReport(
  fiscalYear: string,
): Promise<FiscalReport> {
  return apiRequest<FiscalReport>(`/report/${encodeURIComponent(fiscalYear)}`, {
    method: "GET",
    token: requireAdminToken(),
  });
}

export async function getMyAdminProfile(): Promise<AdminUser> {
  return apiRequest<AdminUser>("/user/me", {
    method: "GET",
    token: requireAdminToken(),
  });
}

export async function updateMyAdminProfile(payload: {
  name: string;
  telephone?: string | null;
  designation?: string | null;
}): Promise<AdminUser> {
  return apiRequest<AdminUser>("/user/me", {
    method: "PUT",
    token: requireAdminToken(),
    body: JSON.stringify(payload),
  });
}

export async function downloadFiscalReport(
  fiscalYear: string,
  format: "pdf" | "xlsx" | "docx",
): Promise<Blob> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/report/${encodeURIComponent(fiscalYear)}/export?format=${format}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${requireAdminToken()}`,
      },
    },
  );

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    const message =
      typeof data === "object" && data !== null && "detail" in data
        ? String(data.detail)
        : "The report could not be exported.";

    throw new Error(message);
  }

  return response.blob();
}
