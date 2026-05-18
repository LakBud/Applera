import React from "react";
import { Card, CardContent } from "../../ui/card";

function OutputCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="group transition hover:shadow-md ">
      <CardContent className="p-5 flex gap-4">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>

        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-h2">{title}</h4>
          <p className="text-sm text-secondary leading-relaxed">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StepCard({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6 flex flex-col gap-3">
        <span className="font-display text-5xl text-primary/10 leading-none select-none absolute top-4 right-5">{n}</span>

        <span className="text-xs font-semibold tracking-widest uppercase text-label">{n}</span>

        <h3 className="text-base font-semibold text-h3">{title}</h3>

        <p className="text-sm text-secondary leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}

type FeatureItem = {
  title: string;
  desc: string;
  icon?: React.ReactNode;
  n?: string;
};

type FeatureSectionProps = {
  id?: string;
  overline: string;
  title: string;
  subtitle?: string;
  items: FeatureItem[];
  variant?: "steps" | "cards";
};

export default function FeatureSection({ id, overline, title, subtitle, items, variant = "cards" }: FeatureSectionProps) {
  return (
    <section id={id} className={`px-6 py-20 border-t border-border ${variant === "steps" ? "bg-surface-muted" : ""}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-2">
          <span className="text-overline">{overline}</span>
          <h2 className="font-display text-3xl md:text-4xl text-h2">{title}</h2>

          {subtitle && <p className="text-secondary text-sm max-w-sm mx-auto">{subtitle}</p>}
        </div>

        {/* Grid — NOW USING REAL COMPONENTS */}
        <div className="grid sm:grid-cols-3 gap-4">
          {items.map((item, i) =>
            variant === "steps" ? (
              <StepCard key={i} n={item.n ?? `0${i + 1}`} title={item.title} desc={item.desc} />
            ) : (
              <OutputCard key={i} icon={item.icon} title={item.title} desc={item.desc} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
