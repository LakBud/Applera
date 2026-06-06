import { Link, useLocation } from "@tanstack/react-router";
import { UserButton } from "@clerk/clerk-react";
import { Logo } from "./Logo";

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

export default function Nav({ isSignedIn, isLoaded }: { isSignedIn: boolean; isLoaded: boolean }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1fa028]/15 bg-[#f7fff5] backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 grid grid-cols-3 items-center">
        {/* LEFT: Logo */}
        <Link to="/">
          <Logo />
        </Link>

        {/* CENTER: Nav */}
        <div className="hidden md:flex justify-center items-center gap-8">
          {isLoaded && isSignedIn && (
            <>
              <NavLink to="/applications">Applications</NavLink>
              <NavLink to="/cvs">CVs</NavLink>
            </>
          )}
        </div>

        {/* RIGHT: Account */}
        <div className="flex items-center justify-self-end h-10">
          {!isLoaded ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : isSignedIn ? (
            <UserButton />
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
