"use client";

import { getFiscalYear } from "@/lib/utils/fiscal_year";

import { useState } from "react";
import { Bot, Send, X } from "lucide-react";
import {
  askReportQuestion,
  type ReportChatResponse,
} from "@/lib/api/report_chat";

export default function AdminChatbot() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<
    Array<{
      role: "user" | "assistant";
      text: string;
      data?: ReportChatResponse;
    }>
  >([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setQuestion("");
    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed },
    ]);
    setLoading(true);

    try {
      const response = await askReportQuestion(trimmed, getFiscalYear());

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: response.answer,
          data: response,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Unable to process your question.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[620px] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#e0e4e8] bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[#0b1f3f] px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white/10 p-2">
                <Bot size={20} />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Compassion AI</h2>
                <p className="text-xs text-white/70">
                  Fiscal-year reporting assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Close AI assistant"
            >
              <X size={19} />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[#f5f7fa] p-4">
            {messages.length === 0 && (
              <div className="rounded-xl border border-[#e0e4e8] bg-white p-4">
                <p className="text-sm font-medium text-[#0b1f3f]">
                  Ask about fiscal-year screening data
                </p>
                <p className="mt-2 text-xs leading-5 text-[#5c6672]">
                  Try asking how many participants were screened, which cohort
                  had severe malnutrition, or how many participants were
                  referred for further treatment.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={
                  message.role === "user"
                    ? "ml-8 rounded-xl bg-[#0054a6] p-3 text-sm text-white"
                    : "mr-4 rounded-xl border border-[#e0e4e8] bg-white p-3 text-sm text-[#1a1a1a]"
                }
              >
                <p className="leading-5">{message.text}</p>

                {message.data &&
                  message.data.relevant_rows.length > 0 && (
                    <div className="mt-3 border-t border-[#e0e4e8] pt-3">
                      {message.data.relevant_rows.length === 1 ? (
                        <div className="rounded-xl bg-[#f5f7fa] p-4 text-center">
                          <p className="text-xs font-medium uppercase tracking-wide text-[#5c6672]">
                            {message.data.relevant_rows[0].label}
                          </p>
                          <p className="mt-1 text-3xl font-bold text-[#0054a6]">
                            {message.data.relevant_rows[0].value}
                          </p>
                          <p className="mt-1 text-[11px] text-[#8a949e]">
                            FY {message.data.fiscal_year}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5c6672]">
                            Supporting data · FY {message.data.fiscal_year}
                          </p>

                          <div className="space-y-3">
                            {message.data.relevant_rows.map((row) => {
                              const maxValue = Math.max(
                                ...message.data!.relevant_rows.map(
                                  (item) => item.value,
                                ),
                                1,
                              );
                              const width = Math.max(
                                4,
                                (row.value / maxValue) * 100,
                              );

                              return (
                                <div key={row.label}>
                                  <div className="mb-1 flex items-center justify-between gap-3">
                                    <span className="min-w-0 truncate text-xs text-[#5c6672]">
                                      {row.label}
                                    </span>
                                    <span className="shrink-0 text-xs font-bold text-[#0b1f3f]">
                                      {row.value}
                                    </span>
                                  </div>

                                  <div className="h-2 overflow-hidden rounded-full bg-[#e0e4e8]">
                                    <div
                                      className="h-full rounded-full bg-[#0054a6]"
                                      style={{ width: `${width}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ))}

            {loading && (
              <div className="mr-16 rounded-xl border border-[#e0e4e8] bg-white p-3 text-sm text-[#5c6672]">
                Thinking…
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-[#e0e4e8] bg-white p-3"
          >
            <div className="flex items-center gap-2 rounded-xl border border-[#e0e4e8] bg-[#f5f7fa] px-3 py-2 focus-within:border-[#0054a6]">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about the report..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8a949e]"
                disabled={loading}
              />

              <button
                type="submit"
                disabled={!question.trim() || loading}
                className="rounded-lg bg-[#0054a6] p-2 text-white transition hover:bg-[#004789] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send question"
              >
                <Send size={17} />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#0054a6] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#004789]"
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      >
        {open ? <X size={19} /> : <Bot size={19} />}
        <span>{open ? "Close" : "Ask Compassion AI"}</span>
      </button>
    </>
  );
}
