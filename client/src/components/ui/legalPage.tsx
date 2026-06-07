import { Footer } from "../common/Footer";
import { Section } from "./section";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: { title: string; content: React.ReactNode }[];
}

export const BulletList = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5">
    {items.map((item) => (
      <li key={item} className="flex gap-2 text-sm text-tx-muted">
        <span className="mt-0.5 shrink-0">·</span>
        {item}
      </li>
    ))}
  </ul>
);

export function LegalPage({ title, lastUpdated, intro, sections }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto px-6 py-16 space-y-10">
        <div className="space-y-2">
          <h1 className="font-display text-4xl text-tx-h1">{title}</h1>
          <p className="text-xs text-tx-muted">Last updated: {lastUpdated}</p>
        </div>
        <p className="text-sm text-tx-secondary leading-relaxed">{intro}</p>
        {sections.map((s) => (
          <Section key={s.title} title={s.title}>
            {s.content}
          </Section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
