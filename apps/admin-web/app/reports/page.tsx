"use client";

import AdminAuthGuard from "@/components/admin_auth_guard";
import { FiscalReport, downloadFiscalReport, getFiscalReport } from "@/lib/api/admin_api";
import { AlertCircle, ArrowLeft, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const cohorts = [
  "Survival Babies",
  "Survival Mothers",
  "Sponsorship Participants",
] as const;

type GeneralMetric =
  | "number_of_registered_participants"
  | "number_of_participants_screened"
  | "number_not_yet_screened"
  | "mild_malnutrition"
  | "moderate_malnutrition"
  | "severe_malnutrition"
  | "immunization_cards"
  | "vitamin_a_supplemented"
  | "dewormed"
  | "hiv_tested";

const generalRows: Array<{ label: string; key: GeneralMetric }> = [
  {
    label: "Registered participants",
    key: "number_of_registered_participants",
  },
  {
    label: "Participants screened",
    key: "number_of_participants_screened",
  },
  {
    label: "Not yet screened",
    key: "number_not_yet_screened",
  },
  {
    label: "Mild malnutrition",
    key: "mild_malnutrition",
  },
  {
    label: "Moderate malnutrition",
    key: "moderate_malnutrition",
  },
  {
    label: "Severe malnutrition",
    key: "severe_malnutrition",
  },
  {
    label: "Immunization cards",
    key: "immunization_cards",
  },
  {
    label: "Vitamin A supplementation",
    key: "vitamin_a_supplemented",
  },
  {
    label: "Dewormed",
    key: "dewormed",
  },
  {
    label: "HIV testing",
    key: "hiv_tested",
  },
];

export default function ReportsPage() {
  const router = useRouter();
  const [report, setReport] = useState<FiscalReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReport() {
      try {
        setLoading(true);
        setError(null);

        const data = await getFiscalReport("2026");

        if (active) {
          setReport(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load the fiscal-year report.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      active = false;
    };
  }, []);

  async function handleExport(format: "pdf" | "xlsx" | "docx") {
    try {
      setExporting(format);
      setError(null);

      const fiscalYear = report?.fiscal_year ?? "2026";
      const blob = await downloadFiscalReport(fiscalYear, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `FY${fiscalYear}_report.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to export the report.",
      );
    } finally {
      setExporting(null);
    }
  }

  return (
    <AdminAuthGuard>
      <main className="min-h-screen bg-[#f5f7fa] p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[#e0e4e8] bg-white px-4 py-2.5 text-sm font-medium text-[#0b1f3f] shadow-sm transition hover:bg-[#f5f7fa]"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>

            <p className="text-sm font-semibold uppercase tracking-wide text-[#0054a6]">
              Health Screening Summary
            </p>

            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#0b1f3f]">
                  Fiscal-Year Report
                </h1>
                <p className="mt-2 text-[#5c6672]">
                  Programme screening summary by participant cohort.
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="rounded-xl border border-[#e0e4e8] bg-white px-5 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6672]">
                    Fiscal Year
                  </p>
                  <p className="mt-1 text-xl font-bold text-[#0b1f3f]">
                    {report?.fiscal_year ?? "2026"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleExport("pdf")}
                    disabled={exporting !== null}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0054a6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004687] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Download size={17} />
                    {exporting === "pdf" ? "Exporting..." : "Export PDF"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="rounded-2xl border border-[#e0e4e8] bg-white p-8 text-center text-sm text-[#5c6672] shadow-sm">
              Loading fiscal-year report...
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
              <AlertCircle className="mt-0.5 shrink-0" size={20} />
              <div>
                <p className="font-semibold">Unable to load report</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          )}

          {report && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#e0e4e8] bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-[#0b1f3f]">
                    REPORT INFORMATION
                  </h2>
                  <p className="mt-1 text-sm text-[#5c6672]">
                    Fiscal-year report and submission details.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6672]">
                      Period / Fiscal Year
                    </p>
                    <p className="mt-1 font-semibold text-[#0b1f3f]">
                      {report.fiscal_year}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6672]">
                      Cluster Name
                    </p>
                    <p className="mt-1 font-semibold text-[#0b1f3f]">
                      {report.center_name || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6672]">
                      Region
                    </p>
                    <p className="mt-1 font-semibold text-[#0b1f3f]">
                      {report.region || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6672]">
                      Screening Completion Date
                    </p>
                    <p className="mt-1 font-semibold text-[#0b1f3f]">
                      {report.submission_metadata.screening_completion_date || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6672]">
                      Report Compiled By
                    </p>
                    <p className="mt-1 font-semibold text-[#0b1f3f]">
                      {report.submission_metadata.compiled_by || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6672]">
                      Telephone Number
                    </p>
                    <p className="mt-1 font-semibold text-[#0b1f3f]">
                      {report.submission_metadata.telephone || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#5c6672]">
                      Designation
                    </p>
                    <p className="mt-1 font-semibold text-[#0b1f3f]">
                      {report.submission_metadata.designation || "Not provided"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-[#e0e4e8] bg-white shadow-sm">
                <div className="border-b border-[#e0e4e8] bg-[#0b1f3f] px-6 py-5">
                  <h2 className="text-lg font-semibold text-white">
                    GENERAL
                  </h2>
                  <p className="mt-1 text-sm text-white/70">
                    Health screening summary by participant group.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] border-collapse">
                    <thead>
                      <tr className="bg-[#f5f7fa]">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#0b1f3f]">
                          Indicator
                        </th>

                        {cohorts.map((cohort) => (
                          <th
                            key={cohort}
                            className="px-6 py-4 text-right text-sm font-semibold text-[#0b1f3f]"
                          >
                            {cohort}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#e0e4e8]">
                      {generalRows.map((row) => (
                        <tr key={row.key} className="hover:bg-[#f5f7fa]">
                          <td className="px-6 py-4 text-sm font-medium text-[#0b1f3f]">
                            {row.label}
                          </td>

                          {cohorts.map((cohort) => {
                            const value =
                              report.report_matrix[cohort]?.[row.key] ?? 0;

                            return (
                              <td
                                key={cohort}
                                className="px-6 py-4 text-right text-sm font-semibold text-[#0b1f3f]"
                              >
                                {value}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-[#e0e4e8] bg-white shadow-sm">
                <div className="border-b border-[#e0e4e8] bg-[#0b1f3f] px-6 py-5">
                  <h2 className="text-lg font-semibold text-white">
                    DISEASE PREVALENCE DATA
                  </h2>
                  <p className="mt-1 text-sm text-white/70">
                    Recorded disease-system findings during screening.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] border-collapse">
                    <thead>
                      <tr className="bg-[#f5f7fa]">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#0b1f3f]">
                          Disease / Condition
                        </th>
                        {cohorts.map((cohort) => (
                          <th
                            key={cohort}
                            className="px-6 py-4 text-right text-sm font-semibold text-[#0b1f3f]"
                          >
                            {cohort}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#e0e4e8]">
                      {[
                        ["Auditory / ENT", "auditory_ent"],
                        ["Circulatory", "circulatory"],
                        ["Digestive / GIT", "digestive_git"],
                        ["Endocrine", "endocrine"],
                        ["Lymphatic", "lymphatic"],
                        ["Musculoskeletal", "musculoskeletal"],
                        ["Nervous", "nervous"],
                        ["Reproductive", "reproductive"],
                        ["Respiratory", "respiratory"],
                        ["Skin", "skin"],
                        ["Genito-urinary", "genito_urinary"],
                        ["Vision / Eye", "vision_eye"],
                        ["Dental", "dental"],
                        ["STI-related conditions", "sti"],
                        ["Malaria", "malaria"],
                      ].map(([label, key]) => (
                        <tr key={key} className="hover:bg-[#f5f7fa]">
                          <td className="px-6 py-4 text-sm font-medium text-[#0b1f3f]">
                            {label}
                          </td>

                          {cohorts.map((cohort) => (
                            <td
                              key={cohort}
                              className="px-6 py-4 text-right text-sm font-semibold text-[#0b1f3f]"
                            >
                              {report.report_matrix[cohort]
                                ?.disease_prevalence[key] ?? 0}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-[#e0e4e8] bg-white shadow-sm">
                <div className="border-b border-[#e0e4e8] bg-[#0b1f3f] px-6 py-5">
                  <h2 className="text-lg font-semibold text-white">
                    SUMMARY
                  </h2>
                  <p className="mt-1 text-sm text-white/70">
                    Treatment and referral activity recorded during screening.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] border-collapse">
                    <thead>
                      <tr className="bg-[#f5f7fa]">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#0b1f3f]">
                          Indicator
                        </th>

                        {cohorts.map((cohort) => (
                          <th
                            key={cohort}
                            className="px-6 py-4 text-right text-sm font-semibold text-[#0b1f3f]"
                          >
                            {cohort}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#e0e4e8]">
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-[#0b1f3f]">
                          Cases treated at screening site
                        </td>

                        {cohorts.map((cohort) => (
                          <td
                            key={cohort}
                            className="px-6 py-4 text-right text-sm font-semibold text-[#0b1f3f]"
                          >
                            {report.report_matrix[cohort]
                              ?.received_treatment_at_site ?? 0}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-[#0b1f3f]">
                          Prescriptions given
                        </td>

                        {cohorts.map((cohort) => (
                          <td
                            key={cohort}
                            className="px-6 py-4 text-right text-sm font-semibold text-[#0b1f3f]"
                          >
                            {report.report_matrix[cohort]?.prescriptions_given ??
                              0}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-[#0b1f3f]">
                          Cases referred for further treatment
                        </td>

                        {cohorts.map((cohort) => (
                          <td
                            key={cohort}
                            className="px-6 py-4 text-right text-sm font-semibold text-[#0b1f3f]"
                          >
                            {report.report_matrix[cohort]
                              ?.referred_for_further_treatment ?? 0}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </AdminAuthGuard>
  );
}
