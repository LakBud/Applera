import { useState } from 'react';

import { Link } from '@tanstack/react-router';

import { Logo } from '../Logo';
import { GithubStarButton } from './GithubStarButton';
import { MobileDrawer } from './MobileDrawer';
import { MobileNavActions } from './MobileNavActions';
import { NavAuthActions } from './NavAuthActions';
import { NavLink } from './NavLink';

export default function Nav({ isSignedIn, isLoaded }: { isSignedIn: boolean; isLoaded: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1fa028]/15 bg-[#f7fff5] backdrop-blur-md">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          {/* LEFT: Logo */}
          <Link to="/" onClick={closeMenu}>
            <Logo />
          </Link>

          {/* CENTER: Nav links — desktop only, truly centered */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
            {isLoaded && (
              <>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/applications">Applications</NavLink>
                <NavLink to="/cvs">CVs</NavLink>
              </>
            )}
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <GithubStarButton className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border text-tx-muted hover:text-tx-body hover:bg-muted/40 transition-colors" />

            <NavAuthActions isLoaded={isLoaded} isSignedIn={isSignedIn} />

            <MobileNavActions
              isLoaded={isLoaded}
              isSignedIn={isSignedIn}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
            />
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <MobileDrawer
          menuOpen={menuOpen}
          closeMenu={closeMenu}
          isLoaded={isLoaded}
          isSignedIn={isSignedIn}
        />
      )}
    </>
  );
}
