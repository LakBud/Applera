import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { useAuth, UserButton } from "@clerk/clerk-react";
import type { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#e8e4dc] font-body">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-display text-lg tracking-tight text-[#e8e4dc] hover:text-[#c9a96e] transition-colors">
            søknad<span className="text-[#c9a96e]">.</span>ai
          </Link>

          <div className="flex items-center gap-6">
            {isSignedIn && (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm text-[#888] hover:text-[#e8e4dc] transition-colors [&.active]:text-[#c9a96e]"
                >
                  Dashboard
                </Link>
                <Link
                  to="/applications"
                  className="text-sm text-[#888] hover:text-[#e8e4dc] transition-colors [&.active]:text-[#c9a96e]"
                >
                  Applications
                </Link>
                <Link to="/cvs" className="text-sm text-[#888] hover:text-[#e8e4dc] transition-colors [&.active]:text-[#c9a96e]">
                  My CVs
                </Link>
              </>
            )}

            {isSignedIn ? (
              <UserButton />
            ) : (
              <Link
                to="/sign-in"
                className="text-sm px-4 py-1.5 border border-[#c9a96e]/40 text-[#c9a96e] hover:bg-[#c9a96e]/10 rounded transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="pt-14">
        <Outlet />
      </main>
    </div>
  );
}
