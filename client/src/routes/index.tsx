import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCreateApplication } from "../api";
import ApplicationResult from "../components/index/ApplicationResult";
import type { z } from "zod";
import { CreateApplicationResponseSchema } from "../api/schemas";
import { Button } from "../components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import CvUploader from "../components/index/CvUploader";

type CreateApplicationResponse = z.infer<typeof CreateApplicationResponseSchema>;

export const Route = createFileRoute("/")({
  component: HomePage,
});

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function StepCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="relative flex flex-col gap-3 p-6 rounded-2xl bg-surface border border-border">
      <span className="font-display text-5xl text-primary/20 leading-none select-none absolute top-4 right-5">{n}</span>
      <span className="text-xs font-semibold tracking-widest uppercase text-label">{n}</span>
      <h3 className="text-base font-semibold text-h3">{title}</h3>
      <p className="text-sm text-secondary leading-relaxed">{desc}</p>
    </div>
  );
}

function OutputCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4 p-5 rounded-2xl bg-surface border border-border card-lift">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-h2">{title}</h4>
        <p className="text-sm text-secondary leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function PreviewMock() {
  return (
    <div className="relative rounded-2xl border border-border bg-surface overflow-hidden shadow-md">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-surface-muted">
        <div className="w-2.5 h-2.5 rounded-full bg-error/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
        <span className="ml-2 text-xs text-caption">Example result</span>
      </div>
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 border-primary/30 bg-primary/5 shrink-0">
            <span className="text-xl font-bold text-h1 leading-none">87</span>
            <span className="text-[9px] text-label uppercase tracking-wide">match</span>
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="h-2 rounded-full bg-primary/20 w-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "87%" }} />
            </div>
            <p className="text-xs text-secondary">Strong match — 6 of 7 key requirements covered</p>
          </div>
        </div>
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-label">Cover letter</span>
          <div className="space-y-2">
            {[100, 92, 78, 95, 60].map((w, i) => (
              <div key={i} className="h-2.5 rounded-full bg-border" style={{ width: `${w}%`, opacity: 0.6 + i * 0.05 }} />
            ))}
            <div className="h-2.5 rounded-full bg-border w-[45%] opacity-40" />
          </div>
        </div>
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-label">Keywords matched</span>
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "Agile", "CI/CD", "Node.js", "+2 more"].map((kw) => (
              <span key={kw} className="badge-green text-xs px-2.5 py-1 rounded-lg font-medium">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-surface to-transparent pointer-events-none" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */

const FAQ = [
  {
    q: "Is my data stored?",
    a: "Yes. Your CVs and generated applications are securely saved to your account so you can reuse them anytime from your dashboard. You can delete them whenever you want.",
  },
  {
    q: "What language is the application written in?",
    a: "It automatically matches the job listing. English job → English application, Norwegian job → Norwegian application, and so on.",
  },
  {
    q: "How does the match score work?",
    a: "It compares your CV against the job description using skills, keywords, and context. It’s meant to highlight strengths and gaps — not to decide your eligibility.",
  },
  {
    q: "Can I use the generated cover letter directly?",
    a: "Yes, but it’s recommended to review and adjust it so it reflects your own voice. The AI gives you a strong draft, not a final submission.",
  },
  {
    q: "Do I need to upload my CV every time?",
    a: "No. Once uploaded, your CV is stored in your account and automatically reused for future applications.",
  },
];

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */

export default function HomePage() {
  const [cvText, setCvText] = useState("");
  const [jobText, setJobText] = useState("");
  const [result, setResult] = useState<CreateApplicationResponse | null>(null);

  const { mutate, isPending, error } = useCreateApplication();

  function handleGenerate() {
    const cv = cvText.trim();
    const job = jobText.trim();
    if (!cv || !job) return;
    mutate({ cvText: cv, jobText: job }, { onSuccess: (data: any) => setResult(data) });
  }

  function handleReset() {
    setResult(null);
    setCvText("");
    setJobText("");
  }

  const canGenerate = !isPending && !!cvText.trim() && !!jobText.trim();

  return (
    <div className="min-h-screen bg-bg text-body">
      {/* ══════════════════════════════════════════════════════
          SECTION 1 — GENERATOR
          Header is intentionally compact — one orienting line,
          no subtext, so textareas are above the fold immediately.
      ══════════════════════════════════════════════════════ */}
      <section id="generator" className="relative px-6 pt-10 pb-20 max-w-6xl mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-48 bg-primary/8 blur-3xl rounded-full pointer-events-none" />

        {/* Header (UNCHANGED) */}
        <div className="relative text-center mb-8 space-y-2">
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            <span className="text-h1">Tailor your application</span> <span className="text-h2">in seconds.</span>
          </h1>

          <p className="text-sm text-secondary max-w-xl mx-auto">
            Paste your CV and a job listing — get a cover letter, match score, and email draft.
          </p>
        </div>

        {/* ───────────── INPUT STATE ───────────── */}
        {!result && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* ── CV (Asset) ── */}
              <div className="space-y-3">
                <Label className="text-overline">Your CV</Label>

                <CvUploader />
              </div>

              {/* ── Job (Context) ── */}
              <div className="space-y-3">
                <Label className="text-overline">Job listing</Label>

                <Textarea
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  placeholder="Paste the job description here…"
                  rows={12}
                  className="
              w-full bg-surface border border-border rounded-xl px-4 py-3
              text-sm resize-none
              focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10
              transition shadow-sm
            "
                />
              </div>
            </div>

            {error && <p className="text-center text-sm text-error">{(error as Error).message}</p>}

            <div className="flex justify-center pt-2">
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="
            px-10 py-6 text-sm font-semibold
            border-border btn-primary text-white
            hover:bg-primary-hover transition-all
            disabled:opacity-40 disabled:cursor-not-allowed
          "
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <SpinnerIcon /> Generating…
                  </span>
                ) : (
                  "Generate application"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ───────────── RESULT STATE ───────────── */}
        {result && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Your application</h2>

              <Button onClick={handleReset} variant="outline" className="text-xs px-3 py-1.5">
                ← New application
              </Button>
            </div>

            <ApplicationResult data={result} />
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section id="how" className="px-6 py-20 border-t border-border bg-surface-muted">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <span className="text-overline">The process</span>
            <h2 className="font-display text-3xl md:text-4xl text-h2">How it works</h2>
            <p className="text-secondary text-sm max-w-sm mx-auto">Three steps — under a minute.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <StepCard n="01" title="Paste your CV" desc="Copy the text from your existing CV — no formatting required." />
            <StepCard
              n="02"
              title="Paste the job listing"
              desc="Grab the text from the job posting. More detail means better tailoring."
            />
            <StepCard
              n="03"
              title="Get your tailored application"
              desc="The AI writes a cover letter, analyses the match, and drafts an email."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — WHAT YOU GET
      ══════════════════════════════════════════════════════ */}
      <section id="outputs" className="px-6 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <span className="text-overline">Deliverables</span>
            <h2 className="font-display text-3xl md:text-4xl text-h2">What you get</h2>
            <p className="text-secondary text-sm max-w-sm mx-auto">Not just a letter — a complete application package.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <OutputCard
              icon={
                <svg className="w-5 h-5 " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
              title="Cover letter"
              desc="Tailored to the role and written in your tone — ready to send."
            />
            <OutputCard
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              title="Match analysis"
              desc="A score, matched keywords, and an honest look at what you cover — and what you're missing."
            />
            <OutputCard
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
              title="Email draft"
              desc="A short, professional email to send directly to the hiring manager."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — PREVIEW
      ══════════════════════════════════════════════════════ */}
      <section className="px-6 py-20 border-t border-border bg-surface-muted">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-overline">Preview</span>
            <h2 className="font-display text-3xl md:text-4xl text-h2 leading-tight">
              See what you get
              <br />
              <span className="text-h1">before you try it</span>
            </h2>
            <p className="text-secondary text-sm leading-relaxed max-w-sm">
              The match score gives you an instant read on your strengths and gaps. Keywords and missing requirements are surfaced
              clearly.
            </p>
            <a
              href="#generator"
              className="inline-block text-sm font-semibold text-secondary bg-primary hover:scale-98 duration-300 px-6 py-2.5 transition"
            >
              Try it yourself →
            </a>
          </div>
          <PreviewMock />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — FAQ
      ══════════════════════════════════════════════════════ */}
      <section id="faq" className="px-6 py-20 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <span className="text-overline">Questions</span>
            <h2 className="font-display text-3xl md:text-4xl text-h2">FAQ</h2>
          </div>

          <div className="bg-surface border border-border rounded-2xl px-6">
            <Accordion type="single" collapsible className="w-full">
              {FAQ.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-sm font-medium text-h2">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-secondary leading-relaxed pb-4">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-display text-lg text-h1">Applera</span>
          <p className="text-caption text-xs">© {new Date().getFullYear()} — Your data is saved to your account.</p>
        </div>
      </footer>
    </div>
  );
}
