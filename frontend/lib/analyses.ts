import type { Analysis } from "@/types/analysis";

export async function getAnalysisById(id: string): Promise<Analysis> {
  const response = await fetch(`http://localhost:4000/analyses/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch analysis");
  }

  return response.json();
}

export async function getAnalyses(): Promise<Analysis[]> {
  const response = await fetch(`http://localhost:4000/analyses`);

  if (!response.ok) {
    throw new Error("Failed to fetch analyses");
  }
  return response.json();
}
