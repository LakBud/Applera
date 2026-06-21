import { Link } from '@tanstack/react-router';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

import { GithubStarButton } from './GithubStarButton';
import { NavLink } from './NavLink';

type Props = {
  menuOpen: boolean;
  closeMenu: () => void;
  isLoaded: boolean;
  isSignedIn: boolean;
};

export function MobileDrawer({ menuOpen, closeMenu, isLoaded, isSignedIn }: Props) {
  return (
    <Sheet open={menuOpen} onOpenChange={(open) => !open && closeMenu()}>
      <SheetContent
        side="top"
        className="md:hidden bg-[#f7fff5] border-b border-[#1fa028]/15 px-6 py-5 flex flex-col gap-5 top-14 h-auto"
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>

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
      </SheetContent>
    </Sheet>
  );
}
