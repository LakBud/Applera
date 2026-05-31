import ApplicationResultSection from "../components/home/sections/ApplicationResultSection";
import FAQSection from "../components/home/sections/FAQ";
import FeatureSection from "../components/home/sections/FeatureSection";
import GeneratorSection from "../components/home/sections/GeneratorSection";
import PreviewSection from "../components/home/sections/PreviewSection";
import { useHomeState } from "../hooks/useHomeState";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";

import { Briefcase } from "lucide-react";

export default function HomePage() {
  const homeState = useHomeState();
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-body">
      {/* ══════════════════════════════════════════════════════
        GENERATOR
      ══════════════════════════════════════════════════════ */}
      <section id="generator" className="relative px-6 pt-10 pb-20 max-w-6xl mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-48 bg-primary/8 blur-3xl rounded-full pointer-events-none" />

        <div className="relative text-center mb-8 space-y-4">
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            <span className="text-h1">Tailor your application</span> <span className="text-h2">in seconds.</span>
          </h1>

          <p className="text-sm text-secondary max-w-xl mx-auto leading-relaxed">
            Paste your CV and a job listing — get a tailored cover letter, match score, and email draft.
          </p>

          {!isSignedIn && isLoaded && (
            <p className="text-xs text-muted-foreground">
              <Link to="/auth/sign-up" className="text-primary underline underline-offset-2 font-medium">
                Create a free account
              </Link>{" "}
              to save applications, track progress, and reuse more of your CVs.
            </p>
          )}

          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-caption">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#1fa028]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Cover letter
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#1fa028]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Match score
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#1fa028]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Email draft
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#1fa028]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              CV summary
            </span>
          </div>
          <p className="text-xs text-caption py-2">Used by students, juniors, and career switchers</p>
        </div>

        {/* ───────────── INPUT STATE ───────────── */}
        <GeneratorSection state={homeState} />
      </section>

      {/* ══════════════════════════════════════════════════════
          APPLICATION SECTION
      ══════════════════════════════════════════════════════ */}
      <ApplicationResultSection state={homeState} />

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <FeatureSection
        id="how"
        variant="steps"
        overline="The process"
        title="How it works"
        subtitle="Three steps — under a minute."
        items={[
          {
            n: "01",
            title: "Paste your CV",
            desc: "Copy the text from your existing CV — no formatting required.",
          },
          {
            n: "02",
            title: "Paste the job listing",
            desc: "Grab the text from the job posting. More detail means better tailoring.",
          },
          {
            n: "03",
            title: "Get your tailored application",
            desc: "The AI writes a cover letter, analyses the match, and drafts an email.",
          },
        ]}
      />

      {/* ══════════════════════════════════════════════════════
          WHAT YOU GET
      ══════════════════════════════════════════════════════ */}
      <FeatureSection
        id="outputs"
        variant="cards"
        overline="Deliverables"
        title="What you get"
        subtitle="Not just a letter — a complete application package."
        items={[
          {
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            ),
            title: "Cover letter",
            desc: "Tailored to the role and written in your tone — ready to send.",
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            ),
            title: "Match analysis",
            desc: "A score, matched keywords, and an honest look at what you cover — and what you're missing.",
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            ),
            title: "Email draft",
            desc: "A short, professional email to send directly to the hiring manager.",
          },
        ]}
      />

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — PREVIEW
      ══════════════════════════════════════════════════════ */}
      <PreviewSection />

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — FAQ
      ══════════════════════════════════════════════════════ */}
      <FAQSection />

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 group shrink-0">
            <Briefcase className="w-6 h-6 text-[#1fa028] group-hover:text-[#166534] transition-colors duration-200" />
            <span className="font-display text-2xl font-semibold tracking-tight text-[#1fa028]">Applera</span>
          </div>

          <p className="text-caption text-xs">© {new Date().getFullYear()} — Your data is saved to your account.</p>
        </div>
      </footer>
    </div>
  );
}
