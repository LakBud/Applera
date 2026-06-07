import { Link } from "@tanstack/react-router";
import { Logo } from "../components/common/Logo";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-6 text-center px-4">
      <Logo />
      <div className="space-y-2">
        <p className="text-7xl font-display font-bold text-primary">404</p>
        <h1 className="text-xl font-semibold text-tx-h1">Page not found</h1>
        <p className="text-sm text-tx-muted max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <Link
        to="/"
        className="text-sm font-semibold px-3 py-1.5 rounded-md bg-[#1fa028] text-white hover:bg-primary/90 transition-all duration-200"
      >
        Go home
      </Link>
    </div>
  );
}
