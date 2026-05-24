import { Link, useLocation } from "@tanstack/react-router";
import { UserButton } from "@clerk/clerk-react";
import { Briefcase } from "lucide-react";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={["text-sm transition-colors relative", isActive ? "text-h2" : "text-secondary hover:text-h2"].join(" ")}
    >
      {children}

      {/* active indicator */}
      {isActive && <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary rounded-full" />}
    </Link>
  );
}

export default function Nav({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-1000 bg-white border-b border-border ">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0 text-primary">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-primary bg-primary/5 group-hover:bg-primary/10 transition-colors duration-200">
            <Briefcase className="w-4 h-4" />
          </div>

          <span className="font-display text-xl text-h2 group-hover:text-h1 transition-colors text-primary duration-200 tracking-tight">
            Applera
          </span>
        </Link>
        {/* Center nav */}
        <div className="hidden md:flex items-center gap-9">
          {isSignedIn && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/applications">Applications</NavLink>
              <NavLink to="/jobs">Jobs</NavLink>
              <NavLink to="/cvs">CVs</NavLink>
              <NavLink to="/interview">Interview Prep</NavLink>
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <UserButton />
            </>
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
  );
}
