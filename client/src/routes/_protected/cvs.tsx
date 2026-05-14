// src/routes/_protected/cvs.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useUploadCVFile, useUploadCVText, useCVs } from "../../api";
import { queryKeys } from "../../api/queryKeys";

export const Route = createFileRoute("/_protected/cvs")({
  component: CVsPage,
});

function CVsPage() {
  const [mode, setMode] = useState<"file" | "text">("text");
  const [cvText, setCvText] = useState("");

  const queryClient = useQueryClient();

  const { data: cvs, isLoading } = useCVs();

  const { mutate: uploadFile, isPending: filePending } = useUploadCVFile();
  const { mutate: uploadText, isPending: textPending } = useUploadCVText();

  const isPending = filePending || textPending;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadFile(file, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.cv.all });
      },
    });
  }

  function handleTextUpload() {
    if (!cvText.trim()) return;

    uploadText(cvText, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.cv.all });
        setCvText("");
      },
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs tracking-widest uppercase text-[#c9a96e]">CV-bibliotek</p>
        <h1 className="font-display text-4xl">Mine CVer</h1>
      </div>

      {/* Upload card */}
      <div className="bg-[#111] border border-white/5 rounded-lg p-6 space-y-5">
        <h2 className="text-sm font-medium text-[#888]">Last opp ny CV</h2>

        {/* Mode toggle */}
        <div className="flex border border-white/5 rounded-lg overflow-hidden w-fit">
          {(["text", "file"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-xs transition-colors ${
                mode === m ? "bg-[#c9a96e] text-[#0a0a0a] font-semibold" : "text-[#555] hover:text-[#888]"
              }`}
            >
              {m === "text" ? "Tekst" : "PDF"}
            </button>
          ))}
        </div>

        {mode === "file" ? (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-10 cursor-pointer hover:border-[#c9a96e]/30 transition-colors">
            <span className="text-sm text-[#555]">{isPending ? "Laster opp..." : "Klikk for å velge PDF"}</span>
            <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} disabled={isPending} />
          </label>
        ) : (
          <div className="space-y-3">
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Lim inn CV-teksten din..."
              rows={10}
              className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#e8e4dc] resize-none font-mono"
            />

            <button
              onClick={handleTextUpload}
              disabled={isPending || !cvText.trim()}
              className="px-6 py-2.5 bg-[#c9a96e] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#d4b97e] transition-colors disabled:opacity-40"
            >
              {isPending ? "Analyserer..." : "Last opp"}
            </button>
          </div>
        )}
      </div>

      {/* CV LIST (REAL DATA) */}
      <div className="space-y-4">
        <h2 className="text-sm text-[#888]">Dine CVer</h2>

        {isLoading && <p className="text-sm text-[#444] animate-pulse">Laster CVer...</p>}

        {!isLoading && cvs?.length === 0 && <p className="text-sm text-[#555]">Ingen CVer enda.</p>}

        {cvs?.map((cv: any) => (
          <div key={cv._id} className="bg-[#111] border border-white/5 rounded-lg p-5 space-y-2">
            <p className="text-sm">{cv.parsed?.name || "Ukjent CV"}</p>

            <div className="flex flex-wrap gap-1.5">
              {cv.parsed?.skills?.slice(0, 10).map((s: string) => (
                <span key={s} className="text-xs bg-[#1a1a1a] border border-white/5 px-2 py-0.5 rounded text-[#888]">
                  {s}
                </span>
              ))}
            </div>

            {cv.parsed?.summary && <p className="text-xs text-[#555]">{cv.parsed.summary}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
