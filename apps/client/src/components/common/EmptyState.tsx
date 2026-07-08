import type { ReactNode } from 'react';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="w-full h-full border border-dashed px-6 py-24 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
      <div className="-translate-y-2 flex flex-col items-center space-y-2">
        <div className="opacity-40">{icon}</div>

        <p className="text-sm">{title}</p>

        {description && <p className="text-xs -mt-1">{description}</p>}
      </div>
    </div>
  );
}
