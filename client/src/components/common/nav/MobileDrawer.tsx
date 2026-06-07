import { Link } from "@tanstack/react-router";
import { NavLink } from "./NavLink";
import { GithubStarButton } from "./GithubStarButton";

type Props = {
  menuOpen: boolean;
  closeMenu: () => void;
  isLoaded: boolean;
  isSignedIn: boolean;
};

export function MobileDrawer({ menuOpen, closeMenu, isLoaded, isSignedIn }: Props) {
  if (!menuOpen) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeMenu} />

      {/* Panel */}
      <div className="absolute top-14 left-0 right-0 bg-[#f7fff5] border-b border-[#1fa028]/15 px-6 py-5 flex flex-col gap-5">
        {/* Nav links */}
        {isLoaded && (
          <div className="flex flex-col gap-4">
            <NavLink to="/" onClick={closeMenu}>
              Home
            </NavLink>
            <NavLink to="/applications" onClick={closeMenu}>
              Applications
            </NavLink>
            <NavLink to="/cvs" onClick={closeMenu}>
              CVs
            </NavLink>
          </div>
        )}

        <div className="h-px bg-[#1fa028]/10" />

        {/* GitHub link */}
        <GithubStarButton className="flex items-center gap-1.5 text-xs font-medium text-tx-muted hover:text-tx-body transition-colors w-fit" />

        {/* Auth buttons */}
        {isLoaded && !isSignedIn && (
          <div className="flex flex-col gap-3">
            <Link
              to="/auth/sign-in/$"
              onClick={closeMenu}
              className="text-sm font-medium text-tx-muted hover:text-tx-body transition text-center py-2 border border-border rounded-md"
            >
              Sign in
            </Link>

            <Link
              to="/auth/sign-up/$"
              onClick={closeMenu}
              className="text-sm font-semibold px-3 py-2 rounded-md bg-[#1fa028] text-white hover:bg-[#166534] transition text-center"
            >
              Get started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
