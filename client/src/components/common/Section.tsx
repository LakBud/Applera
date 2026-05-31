export function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border border-border">
      <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        {action}
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}
