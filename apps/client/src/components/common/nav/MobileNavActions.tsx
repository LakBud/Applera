import { UserButton } from '@clerk/clerk-react';
import { Menu, X } from 'lucide-react';

import { clerkUserButtonAppearance } from '../../../utils/ui/clerkStyle';
import { Button } from '../../ui/button';

type Props = {
  isLoaded: boolean;
  isSignedIn: boolean;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function MobileNavActions({ isLoaded, isSignedIn, menuOpen, setMenuOpen }: Props) {
  return (
    <>
      {isLoaded && isSignedIn && (
        <div className="md:hidden">
          <UserButton appearance={clerkUserButtonAppearance} />
        </div>
      )}

      <Button
        className="md:hidden flex w-8 h-8 text-[#3d5a45] hover:text-[#1fa028] transition-colors"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>
    </>
  );
}
