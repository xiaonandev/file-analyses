"use client";

import type { Analysis, InvoiceContent } from "@/types/analysis";
import { checkAnalysisStatus, updateAnalysis } from "@/lib/analyses";
import { API_URL } from "@/lib/api";
import {
  ArrowLeft,
  Check,
  FileText,
  LoaderCircle,
  Pencil,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type AnalysisDetailsProps = {
  analysis: Analysis;
};

const AnalysisDetails = ({ analysis }: AnalysisDetailsProps) => {
  const [currentAnalysis, setCurrentAnalysis] = useState(analysis);
  const [draft, setDraft] = useState<InvoiceContent | null>(null);
  const [draftTitle, setDraftTitle] = useState(analysis.title);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (currentAnalysis.status !== "processing") return;

    let isCancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const latestAnalysis = await checkAnalysisStatus(currentAnalysis.id);

        if (isCancelled) return;

        setCurrentAnalysis(latestAnalysis);

        if (latestAnalysis.status === "processing") {
          timer = setTimeout(poll, 3000);
        }
      } catch (error) {
        console.error(error);

        if (!isCancelled) {
          timer = setTimeout(poll, 3000);
        }
      }
    };

    timer = setTimeout(poll, 3000);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [currentAnalysis.id, currentAnalysis.status]);

  const isCompleted = currentAnalysis.status === "completed";
  const isEditing = draft !== null;
  const documentUrl = `${API_URL}/analyses/${currentAnalysis.id}/document`;

  const startEditing = () => {
    if (!currentAnalysis.content) return;

    setDraft({ ...currentAnalysis.content });
    setDraftTitle(currentAnalysis.title);
    setSaveError(null);
  };

  const cancelEditing = () => {
    setDraft(null);
    setDraftTitle(currentAnalysis.title);
    setSaveError(null);
  };

  const updateDraftField = (field: keyof InvoiceContent, value: string) => {
    setDraft((currentDraft) =>
      currentDraft
        ? { ...currentDraft, [field]: value.trim() === "" ? null : value }
        : currentDraft,
    );
  };

  const saveChanges = async () => {
    if (!draft || isSaving) return;

    const title = draftTitle.trim();
    if (!title) {
      setSaveError("Document title is required.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const updatedAnalysis = await updateAnalysis(
        currentAnalysis.id,
        title,
        draft,
      );
      setCurrentAnalysis(updatedAnalysis);
      setDraft(null);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save changes.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8f8] text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/analyses">
              <button className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 cursor-pointer">
                <ArrowLeft size={19} />
              </button>
            </Link>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold">
                  {currentAnalysis.title}
                </h1>

                {currentAnalysis.status === "processing" ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    <LoaderCircle size={13} className="animate-spin" />
                    Processing
                  </span>
                ) : currentAnalysis.status === "failed" ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                    <TriangleAlert size={13} />
                    Failed
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <Check size={13} />
                    Completed
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs text-gray-500">
                Created {formatDateTime(currentAnalysis.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={cancelEditing}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={saveChanges}
                  className="rounded-lg bg-[#44777d] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#37666b] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={!isCompleted || !currentAnalysis.content}
                onClick={startEditing}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <Pencil size={15} />
                Edit
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-6 px-8 py-6">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Source document</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Original uploaded file
              </p>
            </div>
          </div>

          <div className="flex min-h-170 items-center justify-center bg-gray-50 p-4">
            {currentAnalysis.s3Key &&
            isPreviewable(currentAnalysis.mimeType) ? (
              <object
                data={documentUrl}
                type={currentAnalysis.mimeType ?? undefined}
                aria-label={currentAnalysis.title}
                className="h-162 w-full rounded-lg border border-gray-200 bg-white object-contain"
              >
                <p className="p-6 text-sm text-gray-500">
                  This document cannot be previewed in your browser.
                </p>
              </object>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <FileText size={36} strokeWidth={1.5} />
                </div>

                <p className="mt-4 text-sm font-medium">
                  {currentAnalysis.title}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {currentAnalysis.s3Key
                    ? `${getDocumentType(currentAnalysis)} preview is not supported by this browser`
                    : "Preview unavailable for this older upload"}
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-semibold">Analysis result</h2>
              <p className="mt-1 text-sm text-gray-500">
                Extracted information from the document.
              </p>
            </div>

            <div className="space-y-6 p-6">
              {currentAnalysis.status === "processing" ? (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <LoaderCircle
                    size={28}
                    className="animate-spin text-[#44777d]"
                  />
                  <p className="mt-4 text-sm font-medium">Analysing invoice</p>
                </div>
              ) : currentAnalysis.status === "failed" ? (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <TriangleAlert size={28} className="text-red-500" />
                  <p className="mt-4 text-sm font-medium">Analysis failed</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <InvoiceField
                    field="vendorName"
                    label="Vendor"
                    draft={draft}
                    value={currentAnalysis.content?.vendorName}
                    onChange={updateDraftField}
                  />
                  <InvoiceField
                    field="invoiceNumber"
                    label="Invoice number"
                    draft={draft}
                    value={currentAnalysis.content?.invoiceNumber}
                    onChange={updateDraftField}
                  />
                  <InvoiceField
                    field="invoiceDate"
                    label="Invoice date"
                    draft={draft}
                    value={currentAnalysis.content?.invoiceDate}
                    onChange={updateDraftField}
                  />
                  <InvoiceField
                    field="dueDate"
                    label="Due date"
                    draft={draft}
                    value={currentAnalysis.content?.dueDate}
                    onChange={updateDraftField}
                  />
                  <InvoiceField
                    field="currency"
                    label="Currency"
                    draft={draft}
                    value={currentAnalysis.content?.currency}
                    onChange={updateDraftField}
                  />
                  <InvoiceField
                    field="subtotal"
                    label="Subtotal"
                    draft={draft}
                    value={currentAnalysis.content?.subtotal}
                    onChange={updateDraftField}
                  />
                  <InvoiceField
                    field="tax"
                    label="Tax"
                    draft={draft}
                    value={currentAnalysis.content?.tax}
                    onChange={updateDraftField}
                  />
                  <InvoiceField
                    field="total"
                    label="Total"
                    draft={draft}
                    value={currentAnalysis.content?.total}
                    onChange={updateDraftField}
                  />
                </div>
              )}
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              <div>
                <Label>Document title</Label>
                {isEditing ? (
                  <input
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-[#44777d] focus:ring-2 focus:ring-[#44777d]/15"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">
                    {currentAnalysis.title}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Last updated {formatDateTime(currentAnalysis.updatedAt)}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
    {children}
  </p>
);

const InvoiceField = ({
  field,
  label,
  value,
  draft,
  onChange,
}: {
  field: keyof InvoiceContent;
  label: string;
  value: string | null | undefined;
  draft: InvoiceContent | null;
  onChange: (field: keyof InvoiceContent, value: string) => void;
}) => (
  <div>
    <Label>{label}</Label>
    {draft ? (
      <input
        value={draft[field] ?? ""}
        onChange={(event) => onChange(field, event.target.value)}
        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-[#44777d] focus:ring-2 focus:ring-[#44777d]/15"
      />
    ) : (
      <p className="mt-2 text-sm font-medium text-gray-800">{value ?? "—"}</p>
    )}
  </div>
);

export default AnalysisDetails;

function isPreviewable(mimeType: string | null): boolean {
  return (
    mimeType === "application/pdf" ||
    mimeType === "image/jpeg" ||
    mimeType === "image/png"
  );
}

function getDocumentType(analysis: Analysis): string {
  const labels: Record<string, string> = {
    "application/pdf": "PDF document",
    "image/jpeg": "JPEG image",
    "image/png": "PNG image",
    "image/tiff": "TIFF image",
  };

  if (analysis.mimeType && labels[analysis.mimeType]) {
    return labels[analysis.mimeType];
  }

  const extension = analysis.title.split(".").pop();
  return extension ? `${extension.toUpperCase()} document` : "Document";
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
