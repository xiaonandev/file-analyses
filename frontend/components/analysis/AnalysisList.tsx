import Link from "next/link";
import {
  FileText,
  Plus,
  Clock3,
  CircleCheck,
  TriangleAlert,
  LoaderCircle,
} from "lucide-react";
import { Analysis } from "@/types/analysis";

const statusConfig = {
  ready: {
    label: "Ready for review",
    icon: Clock3,
    className: "bg-amber-50 text-amber-700",
  },
  processing: {
    label: "Processing",
    icon: LoaderCircle,
    className: "bg-blue-50 text-blue-700",
  },
  confirmed: {
    label: "Confirmed",
    icon: CircleCheck,
    className: "bg-emerald-50 text-emerald-700",
  },
  failed: {
    label: "Failed",
    icon: TriangleAlert,
    className: "bg-red-50 text-red-700",
  },
};
type AnalysisDetailsProps = {
  analyses: Analysis[];
};
export default function AnalysisList({ analyses }: AnalysisDetailsProps) {
  return (
    <main className="min-h-screen bg-[#f7f8f8] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Analyses</h1>

            <p className="mt-1 text-sm text-gray-500">
              Upload documents and review analysis results.
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
          <div className="grid grid-cols-[1fr_180px_140px] border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">
            <span>Document</span>
            <span>Status</span>
            <span>Updated</span>
          </div>

          <div className="divide-y divide-gray-100">
            {analyses.map((analysis) => {
              const status =
                statusConfig[analysis.status as keyof typeof statusConfig];

              const StatusIcon = status.icon;

              return (
                <Link
                  href={`/analyses/${analysis.id}`}
                  key={analysis.id}
                  className="grid grid-cols-[1fr_180px_140px] items-center px-5 py-4 transition hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                      <FileText size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {analysis.title}
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        PDF document
                      </p>
                    </div>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                    >
                      <StatusIcon size={13} />
                      {status.label}
                    </span>
                  </div>

                  <span className="text-sm text-gray-500">
                    {analysis.updatedAt}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
