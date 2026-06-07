import { Logo } from "../common/Logo";

type Props = {
  subtitle?: React.ReactNode;
  children: React.ReactNode;
};

export function AuthLayout({ subtitle, children }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-tx-body px-6 font-sans">
      <div className="w-full max-w-md flex flex-col items-center space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3 w-full mr-15">
          <Logo />

          {subtitle && <p className="text-tx-muted text-sm max-w-sm leading-relaxed">{subtitle}</p>}
        </div>

        {/* Content (Clerk) */}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
