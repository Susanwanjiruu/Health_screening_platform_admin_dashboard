import { apiRequest } from "@/lib/api/client";
import { getAdminSessionToken } from "@/lib/auth/admin_session";

export type ReportChatRow = {
  label: string;
  value: number;
};

export type ReportChatResponse = {
  answer: string;
  fiscal_year: string;
  relevant_rows: ReportChatRow[];
  could_not_answer: boolean;
};

export async function askReportQuestion(
  question: string,
  fiscalYear: string,
): Promise<ReportChatResponse> {
  const token = getAdminSessionToken();

  if (!token) {
    throw new Error("Your admin session has expired. Please log in again.");
  }

  return apiRequest<ReportChatResponse>("/report/ask", {
    method: "POST",
    token,
    body: JSON.stringify({
      question,
      fiscal_year: fiscalYear,
    }),
  });
}
