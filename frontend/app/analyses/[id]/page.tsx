import AnalysisDetails from "@/components/analysis/AnalysisDetails";
import { getAnalysisById } from "@/lib/analyses";

export default async function AnalysisDetailsPage({
  params,
}: PageProps<"/analyses/[id]">) {
  const { id } = await params;
  const analysis = await getAnalysisById(id);

  return (
    <div>
      <AnalysisDetails analysis={analysis} />
    </div>
  );
}
