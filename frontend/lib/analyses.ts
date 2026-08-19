import type { Analysis, InvoiceContent } from "@/types/analysis";

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

export async function deleteAnalysisById(id: string): Promise<Analysis> {
  const response = await fetch(`http://localhost:4000/analyses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete analysis");
  }
  return response.json();
}

export async function checkAnalysisStatus(id: string): Promise<Analysis> {
  const response = await fetch(
    `http://localhost:4000/analyses/${id}/check-status`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to check analysis status");
  }

  return response.json();
}

export async function updateAnalysis(
  id: string,
  title: string,
  content: InvoiceContent,
): Promise<Analysis> {
  const response = await fetch(`http://localhost:4000/analyses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "Failed to update analysis");
  }

  return response.json();
}
