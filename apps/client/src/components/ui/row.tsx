import type { ReactNode } from 'react';

type Props = {
  left: ReactNode;
  middle?: ReactNode;
  right: ReactNode;
  onClick: () => void;
};

export function RowBase({ left, middle, right, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center bg-white/40 justify-between gap-4 px-4 py-3.5 border border-border hover:bg-muted/40 cursor-pointer transition-colors appearance-none w-full text-left"
    >
      {/* LEFT */}
      <div className="min-w-0 flex-1">{left}</div>

      {/* MIDDLE */}
      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground shrink-0">
        {middle}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 shrink-0">{right}</div>
    </button>
  );
}
