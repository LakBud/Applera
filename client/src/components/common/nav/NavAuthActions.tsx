import { Link } from "@tanstack/react-router";
import { UserButton } from "@clerk/clerk-react";
import { clerkUserButtonAppearance } from "../../../utils/clerkStyle";

type Props = {
  isLoaded: boolean;
  isSignedIn: boolean;
};

export function NavAuthActions({ isLoaded, isSignedIn }: Props) {
  return (
    <div className="hidden md:flex items-center gap-3">
      {!isLoaded ? (
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      ) : isSignedIn ? (
        <UserButton appearance={clerkUserButtonAppearance} />
      ) : (
        <>
          <Link
            to="/auth/sign-in/$"
            className="text-sm font-medium text-tx-muted hover:text-tx-body transition whitespace-nowrap"
          >
            Sign in
          </Link>

          <Link
            to="/auth/sign-up/$"
            className="text-sm font-semibold px-3 py-1.5 rounded-md bg-[#1fa028] text-white hover:bg-[#166534] transition whitespace-nowrap"
          >
            Get started
          </Link>
        </>
      )}
    </div>
  );
}
