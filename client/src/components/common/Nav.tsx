import { Link, useLocation } from "@tanstack/react-router";
import { UserButton } from "@clerk/clerk-react";
import { Briefcase } from "lucide-react";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={[
        "text-sm font-medium transition-all duration-200 pb-0.75",
        isActive ? "text-[#1fa028] border-b border-[#1fa028]" : "text-[#3d5a45] hover:text-[#1fa028] border-b border-transparent",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function Nav({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1fa028]/15 bg-[#f7fff5] backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 grid grid-cols-3 items-center">
        {/* LEFT: Brand */}
        <Link to="/" className="flex items-center gap-2 justify-self-start group shrink-0">
          <Briefcase className="w-6 h-6 text-[#1fa028] group-hover:text-[#166534] transition-colors" />
          <span className="font-display text-2xl font-semibold text-[#1fa028] group-hover:text-[#166534] transition-colors">
            Applera
          </span>
        </Link>

        {/* CENTER: Nav */}
        <div className="hidden md:flex justify-center items-center gap-8">
          {isSignedIn && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/applications">Applications</NavLink>
              <NavLink to="/cvs">CVs</NavLink>
            </>
          )}
        </div>

        {/* RIGHT: Account */}
        <div className="flex items-center justify-self-end">
          {isSignedIn ? (
            <div className="flex items-center h-10">
              <UserButton />
            </div>
          ) : (
            <Link
              to="/auth/sign-up"
              className="text-sm font-semibold px-5 py-2 rounded-lg bg-[#1fa028] text-white hover:bg-[#177b3d] transition-all duration-200 whitespace-nowrap"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
