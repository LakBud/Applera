import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
  text?: string;
};

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

export function Loader({ size = 'md', fullScreen = false, className, text }: Props) {
  const spinner = <Loader2 className={cn('animate-spin text-green-900', sizes[size], className)} />;

  if (fullScreen) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 min-h-screen text-green-700">
        {spinner}
        {text && <p className="text-sm text-green-700">{text}</p>}
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex items-center gap-2 text-green-900">
        {spinner}
        <p className="text-sm">{text}</p>
      </div>
    );
  }

  return spinner;
}
