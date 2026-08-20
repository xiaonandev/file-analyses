"use client";

import { useState } from "react";
import { ChevronLeft, Image as ImageIcon, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function AnalysisUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return;
    setError(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      console.log("FormData entries:", [...formData.entries()]);
      const response = await fetch(`${API_URL}/analyses`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message ?? "Upload failed");
      }

      const createdAnalysis = await response.json();
      router.push(`/analyses/${createdAnalysis.id}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8f8] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/analyses"
          className="flex gap-2 items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft width={16} /> <p>Back to analyses</p>
        </Link>

        <div className="mt-6">
          <h1 className="text-2xl font-semibold text-gray-900">New analysis</h1>

          <p className="mt-1 text-sm text-gray-500">
            Upload an invoice to extract and review its data.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-xl border border-gray-200 bg-white p-6"
        >
          {!file ? (
            <label className="flex min-h-65 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-gray-300 hover:bg-gray-100">
              <Upload size={30} className="text-gray-400" />

              <p className="mt-4 text-sm font-medium text-gray-800">
                Upload an invoice image
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Choose a PNG or JPEG image
              </p>

              <input
                className="hidden"
                name="file"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] ?? null;

                  if (
                    selectedFile &&
                    !["image/png", "image/jpeg"].includes(selectedFile.type)
                  ) {
                    setFile(null);
                    setError("Only PNG and JPEG images are supported.");
                    e.target.value = "";
                    return;
                  }

                  setError(null);
                  setFile(selectedFile);
                }}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                  <ImageIcon size={20} className="text-gray-500" />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => setFile(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer disabled:pointer-events-none disabled:opacity-40"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={!file || isLoading}
              className="rounded-lg bg-[#44777d] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#37666b] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              Analyse image
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
