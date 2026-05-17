import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { useAuth, UserButton } from "@clerk/clerk-react";
import type { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="
        text-sm text-secondary hover:text-h2 transition-colors
        [&.active]:text-h1
      "
    >
      {children}
    </Link>
  );
}

function RootLayout() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-text font-body">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="font-display text-lg text-h1 hover:text-h3 transition-colors">
            Applera
          </Link>

          {/* Main navigation */}
          <div className="flex items-center gap-5">
            {isSignedIn && (
              <>
                {/* Core workflow */}
                <NavLink to="/dashboard">Dashboard</NavLink>

                <NavLink to="/applications">Applications</NavLink>

                <NavLink to="/jobs">Jobs</NavLink>

                <NavLink to="/cvs">CVs</NavLink>

                {/* Optional advanced feature */}
                <NavLink to="/interview">Interview Prep</NavLink>
              </>
            )}

            {/* Auth / actions */}
            {isSignedIn ? (
              <div className="ml-2 flex items-center gap-3">
                <Link
                  to="/create"
                  className="
                    text-xs px-3 py-1.5 rounded-lg
                    bg-primary text-white
                    hover:bg-primary-hover
                    transition shadow-green
                  "
                >
                  New application
                </Link>

                <UserButton />
              </div>
            ) : (
              <Link
                to="/auth/sign-up"
                className="
                  text-sm px-4 py-1.5 rounded-lg
                  border border-border
                  text-h2
                  hover:bg-surface-muted
                  transition
                "
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
