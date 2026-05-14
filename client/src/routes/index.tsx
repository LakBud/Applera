import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCreateApplication } from "../api";
import type { CreateApplicationResponse } from "../api";
import ApplicationResult from "../components/applicationResult";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [cvText, setCvText] = useState("");
  const [jobText, setJobText] = useState("");
  const [result, setResult] = useState<CreateApplicationResponse | null>(null);

  const { mutate, isPending, error } = useCreateApplication();

  function handleGenerate() {
    if (!cvText.trim() || !jobText.trim()) return;
    mutate({ cvText, jobText }, { onSuccess: setResult });
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-6 pt-24 pb-16 max-w-6xl mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-[#c9a96e]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative text-center space-y-5 mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c9a96e] font-medium">AI-drevet søknadsverktøy</p>
          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-[1.05]">
            Din CV.
            <br />
            <span className="text-[#c9a96e]">Perfekt tilpasset.</span>
          </h1>
          <p className="text-[#666] text-lg max-w-xl mx-auto leading-relaxed">
            Lim inn din CV og en stillingsannonse. Få en skreddersydd søknad, matchanalyse og e-post — på sekunder.
          </p>
        </div>

        {/* Input grid */}
        {!result && (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase text-[#555]">Din CV</label>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Lim inn CV-teksten din her..."
                rows={12}
                className="w-full bg-[#111] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#e8e4dc] placeholder:text-[#333] resize-none focus:outline-none focus:border-[#c9a96e]/30 transition-colors font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs tracking-widest uppercase text-[#555]">Stillingsannonse</label>
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Lim inn stillingsannonsen her..."
                rows={12}
                className="w-full bg-[#111] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#e8e4dc] placeholder:text-[#333] resize-none focus:outline-none focus:border-[#c9a96e]/30 transition-colors font-mono"
              />
            </div>
          </div>
        )}

        {error && <p className="text-center text-sm text-red-400 mb-4">{error.message}</p>}

        {!result && (
          <div className="flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={isPending || !cvText.trim() || !jobText.trim()}
              className="relative px-10 py-3.5 bg-[#c9a96e] text-[#0a0a0a] text-sm font-semibold rounded-lg hover:bg-[#d4b97e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Genererer søknad...
                </span>
              ) : (
                "Generer søknad"
              )}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Din søknad</h2>
              <button
                onClick={() => {
                  setResult(null);
                  setCvText("");
                  setJobText("");
                }}
                className="text-xs text-[#555] hover:text-[#e8e4dc] transition-colors border border-white/5 px-3 py-1.5 rounded"
              >
                Ny søknad
              </button>
            </div>
            <ApplicationResult data={result} />
          </div>
        )}
      </section>
    </div>
  );
}
