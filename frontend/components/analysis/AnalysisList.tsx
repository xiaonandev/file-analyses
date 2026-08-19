"use client";
import Link from "next/link";
import {
  FileText,
  Plus,
  CircleCheck,
  TriangleAlert,
  LoaderCircle,
} from "lucide-react";
import type { Analysis } from "@/types/analysis";
import { deleteAnalysisById } from "@/lib/analyses";
import { useState } from "react";
import { useRouter } from "next/navigation";

const statusConfig = {
  completed: {
    label: "Completed",
    icon: CircleCheck,
    className: "bg-emerald-50 text-emerald-700",
  },
  processing: {
    label: "Processing",
    icon: LoaderCircle,
    className: "bg-blue-50 text-blue-700",
  },
  failed: {
    label: "Failed",
    icon: TriangleAlert,
    className: "bg-red-50 text-red-700",
  },
};
type AnalysisListProps = {
  analyses: Analysis[];
};
export default function AnalysisList({ analyses }: AnalysisListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (deletingId !== null) return;

    setDeletingId(id);

    try {
      await deleteAnalysisById(id);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };
  return (
    <main className="min-h-screen bg-[#f7f8f8] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Analyses</h1>

            <p className="mt-1 text-sm text-gray-500">
              Upload invoices and review analysis results.
            </p>
          </div>

          <Link
            href="/analyses/new"
            className="flex items-center gap-2 rounded-lg bg-[#44777d] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#37666b]"
          >
            <Plus size={17} />
            New analysis
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="grid grid-cols-[1fr_180px_140px_170px] border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">
            <span>Document</span>
            <span>Status</span>
            <span>Updated</span>
            <span className="text-right">Actions</span>
          </div>

          <div className="divide-y divide-gray-100">
            {analyses.map((analysis) => {
              const status =
                statusConfig[analysis.status as keyof typeof statusConfig];
              const isDeleting = deletingId === analysis.id;

              const StatusIcon = status.icon;

              return (
                <div
                  key={analysis.id}
                  className="grid grid-cols-[1fr_180px_140px_170px] items-center px-5 py-4 transition hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                      <FileText size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {analysis.title}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                    >
                      <StatusIcon
                        size={13}
                        className={
                          analysis.status === "processing"
                            ? "animate-spin"
                            : undefined
                        }
                      />
                      {status.label}
                    </span>
                  </div>

                  <span className="text-sm text-gray-500">
                    {formatDateTime(analysis.updatedAt)}
                  </span>

                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/analyses/${analysis.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                      View
                    </Link>

                    <button
                      disabled={deletingId !== null}
                      onClick={() => handleDelete(analysis.id)}
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
