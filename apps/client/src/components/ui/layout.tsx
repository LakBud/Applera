import { Link } from '@tanstack/react-router';

import { Logo } from '../common/Logo';

type Props = {
  subtitle?: React.ReactNode;
  children: React.ReactNode;
};

export function AuthLayout({ subtitle, children }: Props) {
  return (
    <div className="min-h-dvh w-full bg-bg text-tx-body font-sans overflow-x-hidden">
      {/* OUTER CENTERING LAYER */}
      <div className="flex min-h-dvh justify-center items-center py-10">
        {/* INNER COLUMN */}
        <div className="w-full max-w-md px-4 sm:px-6 py-10 flex flex-col items-center space-y-6 sm:space-y-8">
          {/* HEADER */}
          <div className="w-full flex flex-col items-center text-center space-y-3 mr-2">
            <Link to="/">
              <Logo />
            </Link>
            {subtitle && (
              <div className="text-tx-muted text-sm max-w-sm mx-auto leading-relaxed">
                {subtitle}
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
