import AnalysisList from "@/components/analysis/AnalysisList";
import { getAnalyses } from "@/lib/analyses";

export default async function AnalysesPage() {
  const analyses = await getAnalyses();
  return (
    <div>
      <AnalysisList analyses={analyses} />
    </div>
  );
}
