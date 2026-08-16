"use client";

import { useState } from "react";
import {
  ChevronLeft,
  FileText,
  MoveLeft,
  StepBack,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";

export default function NewAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData(e.currentTarget);

    const res = await fetch("http://localhost:4000/analysis/new", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    const data = await res.json();
    console.log(data);
  };

  return (
    <main className="min-h-screen bg-[#f7f8f8] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
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
                Upload a document
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Choose a PDF, PNG or JPEG
              </p>

              <input
                className="hidden"
                name="file"
                type="file"
                accept=".pdf,image/png,image/jpeg"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                }}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                  <FileText size={20} className="text-gray-500" />
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
                onClick={() => setFile(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 hover:cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={!file}
              className="rounded-lg bg-[#44777d] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#37666b] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              Analyse document
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
