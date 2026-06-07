import ApplicationResultSection from "../components/home/sections/ApplicationResultSection";
import FAQSection from "../components/home/sections/FAQ";
import FeatureSection from "../components/home/sections/Feature";
import GeneratorSection from "../components/home/sections/Generator";
import PreviewSection from "../components/home/sections/Preview";
import { useHomeState } from "../hooks/useHomeState";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { FEATURES, HOW_IT_WORKS, WHAT_YOU_GET } from "../utils/home/features";
import { Footer } from "../components/common/Footer";

export default function HomePage() {
  const homeState = useHomeState();
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div id="top" className="min-h-screen bg-bg text-body">
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
              <Link to="/auth/sign-up/$" className="text-primary underline underline-offset-2 font-medium">
                Create a free account
              </Link>{" "}
              to save applications, track progress, and reuse more of your CVs.
            </p>
          )}

          <div className="flex items-center justify-center gap-6 pt-2 text-xs text-caption">
            {FEATURES.map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#1fa028]" strokeWidth={2.5} />
                {f}
              </span>
            ))}
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
        items={HOW_IT_WORKS}
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
        items={WHAT_YOU_GET}
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
      <Footer />
    </div>
  );
}
