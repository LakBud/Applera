import { Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 group shrink-0', className)}>
      <Briefcase className="w-6 h-6 text-[#1fa028] group-hover:text-[#166534] transition-colors" />
      <span className="font-display text-2xl font-semibold text-[#1fa028] group-hover:text-[#166534] transition-colors">
        Applera
      </span>
    </div>
  );
}
