import AnalysisList from "@/components/analysis/AnalysisList";
import { getAnalyses } from "@/lib/analyses";

export const dynamic = "force-dynamic";

export default async function AnalysesPage() {
  const analyses = await getAnalyses();
  return (
    <div>
      <AnalysisList analyses={analyses} />
    </div>
  );
}
