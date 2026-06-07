export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold tracking-widest uppercase text-tx-muted mb-3">{children}</p>;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-t border-border pt-8">
      <h2 className="text-sm font-semibold text-tx-h1">{title}</h2>
      <div className="text-sm text-tx-secondary leading-relaxed">{children}</div>
    </div>
  );
}
