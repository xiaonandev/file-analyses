import type { Analysis } from "@/types/analysis";

type AnalysisDetailsProps = {
  analysis: Analysis;
};

export default function AnalysisDetails({
  analysis,
}: AnalysisDetailsProps) {
  return <div>{analysis.id}</div>;
}
