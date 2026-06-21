import type { Application } from '@repo/schemas';

interface ApplicationStatusItem {
  status: Application['status'];
}

export function StatusSummary({ applications }: { applications: ApplicationStatusItem[] }) {
  const counts = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1;
    return acc;
  }, {});

  const stats = [
    { label: 'Total', value: applications.length },
    { label: 'Applied', value: counts.applied ?? 0 },
    { label: 'Interviewing', value: counts.interviewing ?? 0 },
    { label: 'Offered', value: counts.offered ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 rounded-sm divide-x divide-y sm:divide-y-0 divide-border border border-border mb-6 bg-white/40 animate-fade-in">
      {stats.map((s) => (
        <div key={s.label} className="px-4 py-3 text-center">
          <p className="text-xl font-semibold">{s.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
